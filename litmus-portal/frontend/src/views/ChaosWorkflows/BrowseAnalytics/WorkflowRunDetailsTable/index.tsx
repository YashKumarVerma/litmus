/* eslint-disable no-unused-expressions */
import React, { useEffect, useState } from 'react';
import {
  Typography,
  TablePagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@material-ui/core';
import moment from 'moment';
import { useQuery } from '@apollo/client';
import { useSelector } from 'react-redux';
import useStyles from './styles';
import TableData from './TableData';
import TableHeader from './TableHeader';
import TableToolBar from './TableToolbar';
import {
  sortAlphaAsc,
  sortAlphaDesc,
  sortNumAsc,
  sortNumDesc,
} from '../../../../utils/sort';
import InfoTooltip from '../../../../components/InfoTooltip';
import { SCHEDULE_DETAILS } from '../../../../graphql';
import {
  Schedules,
  ScheduleDataVars,
  Weights,
} from '../../../../models/graphql/scheduleData';
import { RootState } from '../../../../redux/reducers';

interface RangeType {
  startDate: string;
  endDate: string;
}

interface workFlowTests {
  test_id: number;
  test_name: string;
  test_result: string;
  weight?: number;
  resulting_points?: number;
  last_run: string;
}

interface SortData {
  lastRun: { sort: boolean; ascending: boolean };
  name: { sort: boolean; ascending: boolean };
  testResult: { sort: boolean; ascending: boolean };
}

interface Filter {
  range: RangeType;
  selectedTest: string;
  sortData: SortData;
  selectedTestResult: string;
  searchTokens: string[];
}

interface WorkflowRunDetailsTableProps {
  workflowRunDetails: workFlowTests[];
  workflowID: string;
}

const WorkflowDetailsTable: React.FC<WorkflowRunDetailsTableProps> = ({
  workflowRunDetails,
  workflowID,
}) => {
  const classes = useStyles();
  const [close, setClose] = useState<boolean>(false);
  const [mainData, setMainData] = useState<workFlowTests[]>([]);
  const [filter, setFilter] = React.useState<Filter>({
    range: { startDate: 'all', endDate: 'all' },
    selectedTest: 'All',
    sortData: {
      name: { sort: false, ascending: true },
      lastRun: { sort: true, ascending: false },
      testResult: { sort: false, ascending: true },
    },
    selectedTestResult: 'All',
    searchTokens: [''],
  });
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [reload, setReload] = React.useState<boolean>(false);
  const [resilienceScore, setResilienceScore] = React.useState<number>(0);

  const selectedProjectID = useSelector(
    (state: RootState) => state.userData.selectedProjectID
  );

  // Apollo query to get the scheduled data
  const { data } = useQuery<Schedules, ScheduleDataVars>(SCHEDULE_DETAILS, {
    variables: { projectID: selectedProjectID },
    fetchPolicy: 'cache-and-network',
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getTests = (searchingData: workFlowTests[]) => {
    const uniqueList: string[] = [];
    searchingData.forEach((data) => {
      if (!uniqueList.includes(data.test_name)) {
        uniqueList.push(data.test_name);
      }
    });
    return uniqueList;
  };

  const getTestResults = (searchingData: workFlowTests[]) => {
    const uniqueList: string[] = [];
    searchingData.forEach((data) => {
      if (!uniqueList.includes(data.test_result)) {
        uniqueList.push(data.test_result);
      }
    });
    return uniqueList;
  };

  useEffect(() => {
    const processedWorkflowRunDetails: workFlowTests[] = [];
    let experimentWeights: Weights[] = [];
    const points: number[] = [];
    const weights: number[] = [];

    data?.getScheduledWorkflows.forEach((data) => {
      try {
        if (data.workflow_id === workflowID) {
          experimentWeights = data.weightages;
        }
      } catch (error) {
        console.error(error);
      }
    });

    workflowRunDetails.forEach((detail) => {
      try {
        experimentWeights.forEach((mappedWeight) => {
          try {
            if (detail.test_name === mappedWeight.experiment_name) {
              processedWorkflowRunDetails.push({
                test_id: detail.test_id,
                test_name: mappedWeight.experiment_name,
                test_result: detail.test_result,
                weight: mappedWeight.weightage,
                resulting_points:
                  (detail.test_result === 'Pass' ? 1 : 0) *
                  mappedWeight.weightage,
                last_run: detail.last_run,
              });
              points.push(
                (detail.test_result === 'Pass' ? 1 : 0) * mappedWeight.weightage
              );
              weights.push(mappedWeight.weightage);
            }
          } catch (error) {
            console.error(error);
          }
        });
      } catch (error) {
        console.error(error);
      }
    });

    setMainData(processedWorkflowRunDetails);
    setResilienceScore(
      parseFloat(
        (
          (points.reduce((a, b) => a + b, 0) /
            weights.reduce((a, b) => a + b, 0)) *
          100
        ).toFixed(2)
      )
    );
    setReload(true);
  }, [data, workflowID, reload]);

  const payload: workFlowTests[] = mainData
    .filter((wkf: workFlowTests) => {
      return filter.searchTokens.every(
        (s: string) =>
          wkf.test_name.toLowerCase().includes(s) ||
          (wkf.test_result !== undefined
            ? wkf.test_result.toLowerCase().includes(s)
            : false)
      );
    })
    .filter((data) => {
      return filter.selectedTest === 'All'
        ? true
        : data.test_name === filter.selectedTest;
    })
    .filter((data) => {
      return filter.selectedTestResult === 'All'
        ? true
        : data.test_result === filter.selectedTestResult;
    })
    .filter((data) => {
      return filter.range.startDate === 'all' ||
        (filter.range.startDate && filter.range.endDate === undefined)
        ? true
        : parseInt(data.last_run, 10) * 1000 >=
            new Date(moment(filter.range.startDate).format()).getTime() &&
            parseInt(data.last_run, 10) * 1000 <=
              new Date(
                new Date(moment(filter.range.endDate).format()).setHours(
                  23,
                  59,
                  59
                )
              ).getTime();
    })
    .sort((a: workFlowTests, b: workFlowTests) => {
      // Sorting based on unique fields
      if (filter.sortData.name.sort) {
        const x = a.test_name;
        const y = b.test_name;

        return filter.sortData.name.ascending
          ? sortAlphaAsc(x, y)
          : sortAlphaDesc(x, y);
      }
      if (filter.sortData.lastRun.sort) {
        const x = parseInt(a.last_run, 10);

        const y = parseInt(b.last_run, 10);

        return filter.sortData.lastRun.ascending
          ? sortNumAsc(y, x)
          : sortNumDesc(y, x);
      }
      if (filter.sortData.testResult.sort) {
        const x = a.test_result;
        const y = b.test_result;

        return filter.sortData.testResult.ascending
          ? sortAlphaAsc(x, y)
          : sortAlphaDesc(x, y);
      }
      return 0;
    });

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, payload.length - page * rowsPerPage);

  return (
    <div>
      {close ? (
        <div />
      ) : (
        <div className={classes.root}>
          <div className={classes.tableFix}>
            <div>
              <section className="Heading section">
                <TableToolBar
                  searchToken={filter.searchTokens[0]}
                  handleSearch={(
                    event: React.ChangeEvent<{ value: unknown }> | undefined,
                    token: string | undefined
                  ) =>
                    setFilter({
                      ...filter,
                      searchTokens: (event !== undefined
                        ? ((event.target as HTMLInputElement).value as string)
                        : token || ''
                      )
                        .toLowerCase()
                        .split(' ')
                        .filter((s) => s !== ''),
                    })
                  }
                  tests={getTests(payload)}
                  testResults={getTestResults(payload)}
                  callbackToSetTest={(testName: string) => {
                    setFilter({
                      ...filter,
                      selectedTest: testName,
                    });
                  }}
                  callbackToSetResult={(testResult: string) => {
                    setFilter({
                      ...filter,
                      selectedTestResult: testResult,
                    });
                  }}
                  callbackToSetRange={(
                    selectedStartDate: string,
                    selectedEndDate: string
                  ) => {
                    setFilter({
                      ...filter,
                      range: {
                        startDate: selectedStartDate,
                        endDate: selectedEndDate,
                      },
                    });
                  }}
                />
              </section>
              <section className="table section">
                <TableContainer className={classes.tableMain}>
                  <Table aria-label="simple table">
                    <TableHeader
                      callBackToSort={(sortConfigurations: SortData) => {
                        setFilter({
                          ...filter,
                          sortData: sortConfigurations,
                        });
                      }}
                      callBackToClose={(close: boolean) => {
                        setClose(close);
                      }}
                    />
                    <TableBody>
                      {payload &&
                        payload
                          .slice(0)
                          .slice(
                            page * rowsPerPage,
                            page * rowsPerPage + rowsPerPage
                          )
                          .map((data: workFlowTests) => {
                            return (
                              <TableRow hover tabIndex={-1} key={data.test_id}>
                                <TableData data={data} />
                              </TableRow>
                            );
                          })}
                      {emptyRows > 0 && (
                        <TableRow style={{ height: 75 * emptyRows }}>
                          <TableCell colSpan={6} />
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <div className={classes.paginationArea}>
                  <div className={classes.toolTipGroup}>
                    <Typography className={classes.resultText} display="inline">
                      Resilience Score <InfoTooltip value="Resilience Score" />
                    </Typography>
                    <Typography
                      className={classes.reliabilityScore}
                      display="inline"
                    >
                      <strong>{resilienceScore}%</strong>
                    </Typography>
                  </div>

                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={payload.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                    className={classes.pagination}
                  />
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowDetailsTable;