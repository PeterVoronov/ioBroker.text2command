import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import { TextField, Switch, Typography, withStyles, Box } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Toolbar from '@material-ui/core/Toolbar';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import MenuIcon from '@material-ui/icons/Menu';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';

import I18n from '@iobroker/adapter-react/i18n';
import DialogSelectID from '@iobroker/adapter-react/Dialogs/SelectID';
import isEqual from 'lodash.isequal';

const styles = theme => ({
    root: {
        width: '100%',
        height: '100%',
        padding: 0,
        margin: 0,
        position: 'relative',
    },
    box: {
        display: 'inline-flex',
        justifyContent: 'space-around',
        position: 'relative',
        '& .outlined-basic': {
            padding: '12px 10px',
            //border: `2px solid ${theme.palette.grey[700]}`,
        },
        [theme.breakpoints.down('md')]: {
            '& .outlined-basic': {
                padding: 0,
            },
        },
    },
    boxMobile: {
        padding: 0,
        width: '100%',
        height: 'calc(100% - 48px - 48px)',
        overflow: 'auto'
    },
    boxDesktop: {
        padding: theme.spacing(1),
        width: 'calc(100% - ' + theme.spacing(2) + 'px)',
        height: 'calc(100% - 48px - 48px - ' + theme.spacing(2) + 'px)',
        overflow: 'auto'
    },
    container: {
        width: '100%',
        padding: theme.spacing(2),
        overflow: 'auto',
        [theme.breakpoints.down('md')]: {
            width: 'calc(100% - ' + theme.spacing(3) + 'px)',
            padding: theme.spacing(1),
        },
    },
    textField: {
        flexBasis: '60%',
        [theme.breakpoints.down('sm')]: {
            width: '100%',
            marginTop: theme.spacing(1),
        },
    },
    submitForm: {
        flexDirection: 'row',
        //margin: '10px auto 20px',
        display: 'flex',
        justifyContent: 'right',
        width: '100%',
        [theme.breakpoints.down('xs')]: {
            flexDirection: 'column',
        },
    },
    mainTitle: {
        marginBottom: '30px',
    },
    title: {
        marginTop: 16,
        [theme.breakpoints.down('md')]: {
            maxWidth: 200,
        },
        [theme.breakpoints.down('sm')]: {
            width: '100%',
            maxWidth: 'none',
        },
    },
    row: {
        [theme.breakpoints.down('md')]: {
            alignItems: 'center',
        },
        [theme.breakpoints.down('sm')]: {
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'center',
        },
    },
    btnDanger: {
        marginLeft: 8,
        [theme.breakpoints.down('xs')]: {
            marginLeft: 0,
            marginTop: theme.spacing(0.5),
        },
        //backgroundColor: theme.palette.error?.dark,
    },
    saveAndGoBtn: {
        marginRight: 20,
        [theme.breakpoints.down('xs')]: {
            marginRight: 0,
            marginBottom: theme.spacing(0.5),
        },
    },
    toggleIcon: {
        position: 'absolute',
        zIndex: 1,
        opacity: 0.8,
        top: 8,
        left: 0,
        backgroundColor: theme.palette.primary.main,
        width: 18,
        height: 25,
        cursor: 'pointer',
        padding: '4px 8px 4px 2px',
        color: theme.palette.type === 'dark' ? '#FFF': '#000',
        borderRadius: '0 5px 5px 0',
    },
    switchControl: {
        paddingTop: theme.spacing(1),
        flexBasis: '60%',
    },
    emptyButtons: {
        [theme.breakpoints.down('sm')]: {
            height: 0,
        },
    },
    noRulesText: {
        fontSize: 24,
        color: theme.palette.primary.light
    },
    header: {
        backgroundColor: theme.palette.secondary.main,
        fontSize: 18,
        fontWeight: 'bold',
        paddingLeft: 40,
        zIndex: 0,
        color: theme.palette.type === 'dark' ? '#FFF' : '#000',
    }
});

class RightBar extends PureComponent {
    defaultState = {
        words: I18n.t('Create Rule'),
        name: I18n.t('Create Rule'),
        _break: false,
        editable: false,
        args: [
            {
                default: I18n.t('Argument') + ' 1',
            },
            {
                default: I18n.t('Argument') + ' 2',
            },
        ],
        ack: {
            name: '',
            default: `${I18n.t('Confirmation text')}`,
        },
        id: 0,
    };

    state = {
        localRule: null,
        showDialog: false,
    };

    static getDerivedStateFromProps(props, state) {
        if ((!props.selectedRule && state.localRule) ||
            (props.selectedRule && !state.localRule) ||
            (props.selectedRule?.id !== state.localRule?.id)) {
            return {
                localRule: {...props.selectedRule}
            };
        } else {
            return null;
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (
            prevProps.selectedRule?.name !== this.props.selectedRule?.name ||
            prevState.localRule?.name !== this.state.localRule?.name
        ) {
            if (!this.props.selectedRule || !this.props.selectedRule.name) {
                this.setState({
                    localRule: null,
                });
            } else {
                this.setState({
                    localRule: {
                        ...this.props.selectedRule,
                    },
                });
            }
        } else if (this.state.isLocalStateWasUpdated) {
            const unsavedRule = this.props.unsavedRules[this.state.localRule.id];

            if (
                isEqual(this.props.selectedRule, this.state.localRule) &&
                !unsavedRule?.wasChangedGlobally
            ) {
                this.setState({
                    isLocalStateWasUpdated: false,
                });

                if (!unsavedRule?.wasChangedGlobally) {
                    this.props.removeUnsavedRule(this.state.localRule.id);
                }
            } else if (!unsavedRule && !this.props.pendingSelectedRuleId) {
                this.props.setUnsavedRule(this.state.localRule.id);
            }
        } else if (
            !this.state.isLocalStateWasUpdated &&
            this.props.unsavedRules[this.state.localRule.id]
        ) {
            this.setState({
                isLocalStateWasUpdated: true,
            });
        }

        if (this.props.pendingSelectedRuleId && this.state.isLocalStateWasUpdated) {
            if (this.props.pendingSelectedRuleId === this.state.localRule.id) {
                return;
            }
            this.setState({
                confirmChanges: true,
            });
        }

        if (this.props.lang !== prevProps.lang) {
            this.forceUpdate();
        }
    }

    componentDidMount() {
        if (!this.state.localRule && this.props.selectedRule) {
            this.setState({
                localRule: this.props.selectedRule,
            });
        }
    }

    createConfirmModalActions = () => {
        const { t } = I18n;
        const {
            updateConfig,
            classes,
            selectRule,
            pendingSelectedRuleId,
            clearStateOnConfirmModalUnmount,
            revertChangesFromConfig,
        } = this.props;
        const { localRule } = this.state;

        const cancelSavingChanges = async () => {
            await clearStateOnConfirmModalUnmount();
            this.closeConfirmDialog();
        };

        const dontSaveAndGo = async () => {
            await revertChangesFromConfig(localRule);
            await selectRule(pendingSelectedRuleId);
            await clearStateOnConfirmModalUnmount(localRule.id);

            this.closeConfirmDialog();
        };
        const handleSaveAndGo = async () => {
            await updateConfig(localRule);
            await selectRule(pendingSelectedRuleId);
            await clearStateOnConfirmModalUnmount();

            this.closeConfirmDialog();
        };
        return <FormControl className={classes.submitForm}>
            <div style={{flexGrow: 1}}/>
            <Button
                variant="contained"
                onClick={handleSaveAndGo}
                color="primary"
                startIcon={<CheckIcon/>}
                className={classes.saveAndGoBtn}>
                {t('Save and go')}
            </Button>
            <Button onClick={dontSaveAndGo} variant="contained" color="secondary"
                    startIcon={<CheckIcon/>}
            >
                {t(`Don't save and go`)}
            </Button>
            <Button
                variant="contained"
                className={classes.btnDanger}
                startIcon={<CloseIcon/>}
                onClick={cancelSavingChanges}>
                {t('Cancel')}
            </Button>
        </FormControl>;
    };

    createSaveSettingsForm = () => {
        const { t } = I18n;
        const { updateConfig, classes, revertChangesFromConfig, selectedRule } = this.props;
        const { localRule } = this.state;

        const handleSave = async () => {
            await updateConfig(localRule);
            this.setState({isLocalStateWasUpdated: false,});
        };

        const revertChanges = async () => {
            await revertChangesFromConfig(localRule);

            await this.setState({
                localRule: selectedRule,
                isLocalStateWasUpdated: false,
            });
        };

        if (!this.state.isLocalStateWasUpdated) {
            return <div className={this.props.classes.emptyButtons} />;
        } else {
            return <FormControl className={classes.submitForm}>
                <div style={{flexGrow: 1}}/>
                <Button
                    autoFocus
                    onClick={handleSave}
                    variant="contained"
                    startIcon={<CheckIcon/>}
                    color="primary">
                    {t('Save')}
                </Button>
                <Button
                    variant="contained"
                    className={classes.btnDanger}
                    startIcon={<CloseIcon/>}
                    onClick={revertChanges}>
                    {t('Cancel')}
                </Button>
            </FormControl>;
        }
    };

    closeConfirmDialog = () => {
        this.setState({
            isLocalStateWasUpdated: false,
            confirmChanges: false,
        });
    };

    createInput = ({
        value,
        label,
        onChange,
        type,
        onClick,
        note,
        disabled = !this.state.localRule,
        keywords,
        key,
        onSwitchChange,
    }) => {
        if ((value === undefined || value === null) && !label && !keywords) {
            return null;
        }
        const { classes } = this.props;

        return type !== 'checkbox' ?
            <TextField
                //label={label}
                variant="outlined"
                size="small"
                disabled={disabled}
                value={value}
                helperText={note || ''}
                onClick={onClick}
                onChange={onChange}
                key={key}
                className={clsx('outlined-basic', classes.textField)}
            />
            :
            <FormControl classes={{ root: classes.switchControl }}>
                <Switch
                    key={key}
                    onClick={onSwitchChange}
                    color={'primary'}
                    disabled={disabled}
                    checked={!!value}
                />
            </FormControl>
        ;
    };

    createOptionsData = (state = this.state) => {
        const {
            localRule: { args, ack, editable, _break },
        } = state;
        const { t } = I18n;

        const createInput = this.createInput;
        const handlers = this.handlers;

        const isKeyWordsDisabled = () => {
            if (editable === undefined) {
                return false;
            } else if (editable === false) {
                return true;
            }
            return false;
        };

        return [
            {
                title: t('Keywords'),
                item: createInput({
                    value: this.state.localRule?.words || '',
                    onChange: handlers.keywordsText,
                    keywords: true,
                    disabled: isKeyWordsDisabled(),
                    key: 'keywords',
                }),
                id: 1,
            },
            {
                title: t('Interrupt processing'), //`${t('Break')}:`,
                item: createInput({
                    type: 'checkbox',
                    value: _break,
                    onSwitchChange: handlers.breakOnSwitch,
                    key: 'break',
                }),
                id: 2,
            },
            {
                title: args && args[0]?.name, //`${t('Argument')}:`,
                item: createInput({
                    value: args && this.state.localRule.args[0]?.default,
                    label: args && args[0]?.name,
                    type: args && args[0]?.type,
                    onClick: this.handleSetDialogClick.bind(this, args && args[0]),
                    onSwitchChange: handlers.param1OnSwitch,
                    key: 'Param1',
                }),
                id: 3,
            },
            {
                title: args && args[1]?.name, //`${t('Argument')}:`,
                item: createInput({
                    value: args && this.state.localRule.args[1]?.default,
                    label: args && args[1]?.name,
                    type: args && args[1]?.type,
                    onChange: handlers.param2Text,
                    onSwitchChange: handlers.param2OnSwitch,
                    key: 'Param2',
                }),
                id: 4,
            },
            {
                title: t('Confirmation text'),
                item: createInput({
                    value: ack && ack.default,
                    label: ack && ack.name,
                    note: t(
                        'You can use %s, that will be replaced with current value of state. %u will be replaced by unit'
                    ),
                    type: ack && ack.type,
                    key: 'confirmationText',
                    onChange: handlers.confirmText,
                    onSwitchChange: handlers.confirmOnSwitch,
                }),
                id: 5,
            },
        ];
    };

    createInputHandlers = () => {
        const _this = this;

        return {
            keywordsText(event) {
                _this.setState({
                    localRule: {
                        ..._this.state.localRule,
                        words: event.target.value,
                    },
                    isLocalStateWasUpdated: true,
                });
            },
            param2Text(event) {
                _this.setState({
                    localRule: {
                        ..._this.state.localRule,
                        args: _this.state.localRule.args.map((arg, index) =>
                            index > 0
                                ? {
                                      ...arg,
                                      default: event.target.value,
                                  }
                                : arg
                        ),
                    },
                    isLocalStateWasUpdated: true,
                });
            },
            confirmText(event) {
                _this.setState({
                    localRule: {
                        ..._this.state.localRule,
                        ack: {
                            ..._this.state.localRule.ack,
                            default: event.target.value,
                        },
                    },
                    isLocalStateWasUpdated: true,
                });
            },
            param1OnSwitch() {
                _this.setState({
                    localRule: {
                        ..._this.state.localRule,
                        args: _this.state.localRule.args.map((arg, index) =>
                            !index ? { ...arg, default: !arg.default ? true : !arg.default } : arg
                        ),
                    },
                    isLocalStateWasUpdated: true,
                });
            },
            param2OnSwitch() {
                _this.setState({
                    localRule: {
                        ..._this.state.localRule,
                        args: _this.state.localRule.args.map((arg, index) =>
                            index ? { ...arg, default: !arg.default ? true : !arg.default } : arg
                        ),
                    },
                    isLocalStateWasUpdated: true,
                });
            },
            confirmOnSwitch() {
                _this.setState({
                    localRule: {
                        ..._this.state.localRule,
                        ack: {
                            ..._this.state.localRule.ack,
                            default: !_this.state.localRule.ack.default,
                        },
                    },
                    isLocalStateWasUpdated: true,
                });
            },
            async breakOnSwitch() {
                await _this.setState({
                    localRule: {
                        ..._this.state.localRule,
                        _break: !_this.state.localRule._break,
                    },
                    isLocalStateWasUpdated: true,
                });
            },
        };
    };

    handlers = this.createInputHandlers();

    handleSetDialogClick = arg => {
        if (arg.type === 'id') {
            this.setState({
                showDialog: true,
            });
        }
    };

    handleDialogSelectIdSubmit = selected => {
        this.setState({
            localRule: {
                ...this.state.localRule,
                args: this.state.localRule.args.map((arg, index) =>
                    !index
                        ? {
                              ...arg,
                              default: selected,
                          }
                        : arg
                ),
            },
            isLocalStateWasUpdated: true,
        });
    };

    renderConfirmDialog() {
        return this.state.confirmChanges ? (
            <Dialog fullWidth open={this.state.confirmChanges} maxWidth={'md'}>
                <DialogTitle>
                    {I18n.t('Please confirm or cancel changes before leaving')}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {I18n.t('You have changed rule') + ': '}{' '}
                        <strong>{this.state.localRule.name}</strong>
                    </Typography>
                    <DialogActions>{this.createConfirmModalActions()}</DialogActions>
                </DialogContent>
            </Dialog>
        ) : null;
    }

    renderSelectIdDialog() {
        return this.state.showDialog ?
            <DialogSelectID
                imagePrefix={'../..'}
                socket={this.props.socket}
                title={'Select ID'}
                onClose={id => {
                    console.log(id);
                    this.setState({ showDialog: false });
                }}
                onOk={this.handleDialogSelectIdSubmit}
            />: null;
    }

    render() {
        const {
            localRule,
            isLocalStateWasUpdated,
        } = this.state;

        const { classes, isLeftBarOpen, toggleLeftBar } = this.props;
        const name = localRule ? localRule.name : '';

        if (!this.props.selectedRule) {
            return null;
        }

        return <div className={classes.root}>
            <Box className={classes.toggleIcon} onClick={toggleLeftBar}>
                {isLeftBarOpen || this.props.isMobile ? <MenuIcon /> : <ArrowBackIcon />}
            </Box>
            <Toolbar position="static" variant="dense" className={this.props.classes.header}>
                {name}
            </Toolbar>

            <Box className={clsx(classes.box, this.props.isMobile ? classes.boxMobile : classes.boxDesktop)} key={this.props.selectedRule ? this.props.selectedRule.id : 'emptyLeft'}>
                {localRule ?
                    <Paper className={classes.container} mx="auto">
                        {this.createOptionsData().map(({title, item, id}) => {
                            if (!item) {
                                return null;
                            }

                            return <Box
                                display="flex"
                                justifyContent="space-between"
                                mb="10px"
                                key={id}
                                className={classes.row}>
                                <Typography
                                    variant="h6"
                                    component="h6"
                                    align="left"
                                    className={classes.title}>
                                    {title ? title + ':' : ''}
                                </Typography>
                                {item}
                            </Box>;
                        })}
                    </Paper>
                    :
                    null
                }

                {this.renderSelectIdDialog()}
                {this.renderConfirmDialog()}
            </Box>

            {localRule ? <Toolbar position="static" variant="dense" className={this.props.classes.header}>
                {this.createSaveSettingsForm()}
            </Toolbar> : null}

        </div>;
    }
}

export default withStyles(styles)(RightBar);

RightBar.propTypes = {
    selectedRule: PropTypes.shape({
        name: PropTypes.string,
        id: PropTypes.string,
        rule: PropTypes.string,
        ack: PropTypes.shape({
            default: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        }),
        arg: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string,
                type: PropTypes.string,
                default: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
            })
        ),
        words: PropTypes.string,
    }).isRequired,
    socket: PropTypes.object.isRequired,
    updateConfig: PropTypes.func.isRequired,
    revertChangesFromConfig: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    selectRule: PropTypes.func.isRequired,
    pendingSelectedRuleId: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    clearStateOnConfirmModalUnmount: PropTypes.func.isRequired,
    unsavedRules: PropTypes.object.isRequired,
    setUnsavedRule: PropTypes.func.isRequired,
    removeUnsavedRule: PropTypes.func.isRequired,
    toggleLeftBar: PropTypes.func.isRequired,
    isLeftBarOpen: PropTypes.bool,
    isMobile: PropTypes.bool.isRequired,
};
