import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.common.white,
    padding: theme.spacing(1),
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
  btn1: {
    border: 'none !important',
    color: theme.palette.primary.main,
  },

  // General Component
  generalContainer: {
    display: 'flex',
    flexDirection: 'column',
  },

  // Target Component
  inputDiv: {
    display: 'flex',
    flexDirection: 'column',
  },
  annotation: {
    marginRight: theme.spacing(2),
    marginTop: theme.spacing(0.6),
  },
  annotationDesc: {
    fontSize: '0.75rem',
    maxWidth: '25rem',
  },
  annotationToggleBtn: {
    width: '4.5rem',
    height: '2.187rem',
  },
  text: {
    textTransform: 'none',
  },

  // Probes Table
  table: {
    minWidth: '40.625rem',
    minHeight: '9rem',
  },

  // Probes Popover
  probePopOver: {
    marginTop: theme.spacing(1.25),
  },
  popOverDiv: {
    maxWidth: 'fit-content',
    padding: theme.spacing(2.5),
  },
  probeText: {
    fontSize: '1rem',
  },
  deleteIcon: {
    width: '1.25rem',
    height: '1.25rem',
  },
}));
export default useStyles;
