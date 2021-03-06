import { Divider, Typography } from '@material-ui/core';
import { ButtonFilled, ButtonOutlined } from 'litmus-ui';
import React from 'react';
import Scaffold from '../../../containers/layouts/Scaffold';
import { preDefinedWorkflowData } from '../../../models/predefinedWorkflow';
import { LocationState } from '../../../models/routerModel';
import useActions from '../../../redux/actions';
import * as WorkflowActions from '../../../redux/actions/workflow';
import { history } from '../../../redux/configureStore';
import { getProjectID, getProjectRole } from '../../../utils/getSearchParams';
import ExperimentDetails from './ExperimentDetails';
import Head from './Head';
import Recommendation from './Recommendation';
import useStyles from './styles';

interface LocationObjectProps {
  workflowData: preDefinedWorkflowData;
  testNames: string[];
  testWeights: number[];
}

interface BrowseTemplateProps {
  location: LocationState<LocationObjectProps>;
}

const BrowseAWorkflow: React.FC<BrowseTemplateProps> = ({ location }) => {
  const classes = useStyles();
  const projectID = getProjectID();
  const userRole = getProjectRole();
  const workflowAction = useActions(WorkflowActions);
  const { workflowData, testNames, testWeights } = location.state;

  return (
    <Scaffold>
      <div className={classes.root}>
        <Typography className={classes.headerTitle}>
          Browse a workflow template
        </Typography>
        <Typography variant="subtitle1" className={classes.bodytext}>
          See details of your workflow template
        </Typography>
        <section className={classes.contentWrapper}>
          {/* Header */}
          <Head
            image={workflowData.urlToIcon}
            title={workflowData.title}
            details={workflowData.details}
          />
          <Divider className={classes.m2} />

          {/* Experiment Details */}
          <ExperimentDetails
            testNames={testNames}
            testWeights={testWeights}
            experimentinfo={workflowData.experimentinfo}
          />
          <Divider className={classes.m2} />

          {/* Recommendation */}
          <Recommendation recommendation={workflowData.recommendation} />
          <Divider className={classes.m2} />

          {/* Buttons */}
          <div className={classes.spaceBetween}>
            <ButtonOutlined onClick={() => history.push('/workflows')}>
              <>Back</>
            </ButtonOutlined>
            <ButtonFilled
              variant="success"
              onClick={() => {
                workflowAction.setWorkflowDetails({
                  description: '',
                  isCustomWorkflow: false,
                  customWorkflows: [],
                });
                history.push({
                  pathname: '/create-workflow',
                  search: `?projectID=${projectID}&projectRole=${userRole}`,
                });
              }}
            >
              <>Schedule this template</>
            </ButtonFilled>
          </div>
        </section>
      </div>
    </Scaffold>
  );
};

export default BrowseAWorkflow;
