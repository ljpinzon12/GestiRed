import React, {Component} from 'react';
import {VerticalTimeline, VerticalTimelineElement} from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import {Work} from '@material-ui/icons';
import ResourcesAPI from "../api/ResourcesAPI";
import UserAPI from "../api/UsersAPI";
import PhasesAPI from "../api/PhasesAPI";
import QualityControlAPI from "../api/QualityControlAPI";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import "./Timeline.css";

class Timeline extends Component {

  state = {
    resources: this.props.resources,
    currentResource: this.props.resource,
    phases: null,
    commentsDialog: false,
    responsibleDialog: false,
    endPhaseDialog: false,
    reviewDialog: false,
    usersWithRol: [],
    responsible: "",
    responsibleByResource: [],
    qualityControl: [],
    idPhase: 0,
    qualityObjectComments: [],
    qualityComments: [],
    disableButton: false,
    idQualityControl: 1,
    multiline: 'Escribe aquí...',
    users: null
  };

  componentDidMount() {
    ResourcesAPI.getResourceStages(this.state.currentResource.id, (response) => {
      this.setState({
        phases: response.data.objects
      });
    });
    UserAPI.getAllUsers((response) => {
      this.setState({
        users: response.data.objects
      }, () =>
        (
          this.state.users && this.state.users.map((actual, i) => (
            this.state.currentResource.responsibles.map((responsible, j) => (
              (actual.name + " " + actual.surname === responsible) &&
              this.state.usersWithRol.push(actual)
            ))
          ))));
    });
    QualityControlAPI.getQualityControl((response) => {
      this.setState({
        qualityControl: response.data.objects,
      }, () => (
        this.state.qualityControl && this.state.qualityControl.map((actual) => {
          if (this.state.currentResource.id === actual.resource.id) {
            this.state.responsibleByResource.push(actual.responsible.name + " " + actual.responsible.surname)
          }
        })
      ))
    });
    QualityControlAPI.getComments(this.state.currentResource.id, (response) => {
      const qualityComments = response.data.objects.map((actual) => {
        return actual.value
      });
      this.setState({
          qualityObjectComments: response.data.objects,
          qualityComments
        },
      )
    })
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };
  openReviewDialog = () => {
    this.setState({reviewDialog: true})
  };


  openResponsibleDialog = () => {
    this.setState({responsibleDialog: true})
  };

  openCommentsDialog = () => {
    this.setState({commentsDialog: true})
  };


  openEndPhaseDialog = (idPhase) => {
    this.setState({endPhaseDialog: true, idPhase})
  };

  handleCloseReviewDialog = () => {
    this.setState({reviewDialog: false});
  };

  handleCloseCommentsDialog = () => {
    this.setState({commentsDialog: false});
  };

  handleCloseResponsibleDialog = () => {
    this.setState({responsibleDialog: false});
  };

  handleCloseEndPhaseDialog = () => {
    this.setState({endPhaseDialog: false});
  };

  sendComment = () => {
    QualityControlAPI.postComments({
      resource: "/gestired/resource/" + this.state.currentResource.id + "/",
      value: this.state.multiline
    }, () => {
      QualityControlAPI.getComments(this.state.currentResource.id, (response) => {
        const qualityComments = response.data.objects.map((actual) => {
          return actual.value
        });
        this.setState({
            qualityObjectComments: response.data.objects,
            qualityComments
          },
        )
      })
    });
    this.handleCloseCommentsDialog()
  };

  saveQualityResponsible = () => {

    const userId = this.state.users.find(user => user.name === this.state.responsible).id;

    UserAPI.saveQualityResponsible({
      resource: "/gestired/resource/" + this.state.currentResource.id + "/",
      responsible: "/gestired/user/" + userId + "/",
      createUser: "/gestired/user/" + "1/"
    }, () => {
      QualityControlAPI.getQualityControl((response) => {
        const responsibleByResource = response.data.objects.filter(actual => {
          return this.state.currentResource.id === actual.resource.id
        }).map(actual => {
          return actual.responsible.name + " " + actual.responsible.surname
        });
        this.setState({
          responsibleByResource,
          qualityControl: response.data.objects
        })
      })
    });
    this.handleCloseResponsibleDialog();
  };

  sendNotification = () => {
    const qualityId = this.state.qualityControl.find(q => q.responsible.name + " " + q.responsible.surname
      === this.state.responsibleByResource[0]).id;

    QualityControlAPI.sendNotification(
      {
        qualityControl_id: qualityId,
        resource_name: this.state.currentResource.name,
        responsible_name: this.state.responsibleByResource[0]
      }
    );

    this.handleCloseReviewDialog();
    this.setState({
      disableButton: true,
    })
  };

  endPhase = () => {
    PhasesAPI.createNewPhase({
      phaseType: "/gestired/phaseType/" + (this.state.idPhase + 1) + "/",
      resources: "/gestired/resource/" + this.state.currentResource.id + "/"
    }, () => {
      ResourcesAPI.getResourceStages(this.state.currentResource.id, (response) => {
        this.setState({
          phases: response.data.objects

        });
      });
    });
    this.handleCloseEndPhaseDialog();
  };

  render() {
    return (
      <div className="timeline">
        <h1>Timeline</h1>
        <VerticalTimeline>
          {this.state.phases ? this.state.phases.map((actual) => (
            <VerticalTimelineElement
              key={actual.id}
              className="vertical-timeline-element--work"
              iconStyle={{background: 'rgb(33, 150, 243)', color: '#fff'}}
              icon={<Work/>}
            >
              <h2
                className="vertical-timeline-element-title">{this.state.currentResource.name ? this.state.currentResource.name : "Control de calidad"}</h2>
              <h3 className="vertical-timeline-element-title">{actual.phaseType.name}</h3>
              <p>
                Fecha inicial: {actual.initDate}<br/>
                Fecha final: {actual.endDate}<br/>
                Estado: En proceso
              </p>
              <Button variant="outlined" color="primary" className="timeline__responsible"
                      onClick={this.openResponsibleDialog}>
                Responsables
              </Button>
              <br/>
              {actual.phaseType.name === 'Control de calidad' ?
                <div>
                  <Button variant="outlined" color="primary" className="timeline__comments"
                          onClick={this.openCommentsDialog}>
                    Comentarios
                  </Button>
                  <br/>
                  {this.state.disableButton || this.props.fakeCurrentUser === 'Lady Pinzón'
                    ?
                    <Tooltip
                      title={this.props.fakeCurrentUser === 'Lady Pinzón' ? "No puede enviar notificación, usted es el encargado de control de calidad"
                        :
                        "Ya enviaste notificación de control de calidad"}>
                      <span>
                      <Button variant="outlined" color="secondary" disabled className="timeline__review-disabled-button"
                              onClick={this.openReviewDialog}>
                        Solicitar revisión
                      </Button>
                      </span>
                    </Tooltip>
                    :
                    <Button variant="outlined" color="secondary" className="timeline__review"
                            onClick={this.openReviewDialog}>
                      Solicitar revisión
                    </Button>
                  }

                  <br/>
                  {this.props.fakeCurrentUser === "Lady Pinzón" ?
                    <Tooltip title="No puedes cambiar de fase porque solamente es el encargado de control de calidad">
                      <span>
                        <Button variant="outlined" disabled color="secondary" className="timeline__end-phase"
                                onClick={() => this.openEndPhaseDialog(actual.phaseType.id)}>
                            Terminar fase
                        </Button>
                        </span>
                    </Tooltip>
                    :
                    <Button variant="outlined" color="secondary" className="timeline__end-phase"
                            onClick={() => this.openEndPhaseDialog(actual.phaseType.id)}>
                      Terminar fase
                    </Button>
                  }
                </div>
                :
                this.props.fakeCurrentUser === "Lady Pinzón" ?
                  <Tooltip title="No puedes cambiar de fase porque solamente es el encargado de control de calidad">
                      <span>
                        <Button variant="outlined" disabled color="secondary" className="timeline__end-phase"
                                onClick={() => this.openEndPhaseDialog(actual.phaseType.id)}>
                            Terminar fase
                        </Button>
                        </span>
                  </Tooltip>
                  :
                  <Button variant="outlined" color="secondary" className="timeline__end-phase"
                          onClick={() => this.openEndPhaseDialog(actual.phaseType.id)}>
                    Terminar fase
                  </Button>
              }

              <Dialog
                open={this.state.reviewDialog}
                onClose={this.handleCloseReviewDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                className="timeline__dialog"
              >
                <DialogTitle id="alert-dialog-title">{"Enviar notificación de control de calidad"}</DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    Se enviara un correo a {this.state.responsibleByResource[0]} informando que ya puede hacer revisión
                    de este recurso. ¿Está seguro de solicitar control de calidad?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={this.handleCloseReviewDialog} color="primary">
                    Cancelar
                  </Button>
                  <Button onClick={this.sendNotification} color="primary" autoFocus>
                    Continuar
                  </Button>
                </DialogActions>
              </Dialog>
              <Dialog
                open={this.state.responsibleDialog}
                onClose={this.handleCloseResponsibleDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                className="timeline__dialog"
              >
                <DialogTitle id="alert-dialog-title">{"Responsables"}</DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    {this.state.usersWithRol.length === 0 ? "" : this.state.usersWithRol.map((act, j) => (
                      <h4 key={j}>
                        {act.name + " " + act.surname + ": " + act.rols.map((rol) =>
                          (" " + rol.name)
                        )}</h4>
                    ))}
                    {
                      this.state.responsibleByResource.length === 0 ? "" : this.state.responsibleByResource.map((actual, i) => (
                        <h4 key={i}>
                          {actual + ": Control de calidad"}
                        </h4>
                      ))
                    }

                  </DialogContentText>
                </DialogContent>
                <DialogTitle id="alert-dialog-title">{"Asignar responsable de control de calidad"}</DialogTitle>
                <DialogContent>
                  <TextField
                    id="standard-select-currency"
                    select
                    label="Selección"
                    className="timeline__add-responsible"
                    value={this.state.responsible}
                    onChange={this.handleChange('responsible')}
                    SelectProps={{
                      MenuProps: {
                        className: "timeline__menu",
                      },
                    }}
                    helperText="Selecciona una persona"
                    margin="normal"
                  >
                    {this.state.users && this.state.users.map(option => (
                      <MenuItem key={option.name} value={option.name}>
                        {option.name + " " + option.surname}
                      </MenuItem>
                    ))}
                  </TextField>
                </DialogContent>
                <DialogActions>
                  <Button onClick={this.handleCloseResponsibleDialog} color="primary">
                    Cancelar
                  </Button>
                  <Button onClick={this.saveQualityResponsible} color="primary" autoFocus>
                    Continuar
                  </Button>
                </DialogActions>
              </Dialog>
              <Dialog
                open={this.state.commentsDialog}
                onClose={this.handleCloseCommentsDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                className="timeline__dialog"
              >
                <DialogTitle id="alert-dialog-title">{"Comentarios"}</DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    {this.state.qualityComments && this.state.qualityComments.map((actual) => (
                      <div>- {actual} <br/></div>
                    ))}
                  </DialogContentText>
                  {this.props.fakeCurrentUser === "Lady Pinzón" &&
                  <TextField
                    id="outlined-multiline-flexible"
                    label="Comentarios"
                    multiline
                    rowsMax="4"
                    value={this.state.multiline}
                    onChange={this.handleChange('multiline')}
                    className="timeline__comments-multiline"
                    margin="normal"
                    variant="outlined"
                  />
                  }
                </DialogContent>
                <DialogActions>
                  <Button onClick={this.handleCloseCommentsDialog} color="primary">
                    Cancelar
                  </Button>
                  {this.props.fakeCurrentUser === "Lady Pinzón" &&
                  <Button onClick={this.sendComment} color="primary" autoFocus>
                    Continuar
                  </Button>
                  }
                </DialogActions>
              </Dialog>
              <Dialog
                open={this.state.endPhaseDialog}
                onClose={this.handleCloseEndPhaseDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                className="timeline__dialog"
              >
                <DialogTitle id="alert-dialog-title">{"Terminar fase"}</DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    Se dará por terminada esta fase del recurso y se iniciará la siguiente.
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={this.handleCloseEndPhaseDialog} color="primary">
                    Cancelar
                  </Button>
                  <Button onClick={this.endPhase} color="primary" autoFocus>
                    Continuar
                  </Button>
                </DialogActions>
              </Dialog>
            </VerticalTimelineElement>
          )) : ""}
        </VerticalTimeline>
      </div>
    );
  }
}

export default Timeline;