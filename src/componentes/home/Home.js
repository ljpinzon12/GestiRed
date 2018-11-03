import React, {Component} from 'react';
import './Home.css';
import Card from '@material-ui/core/Card';
import Options from "../home/Options";
import InformationPanel from "../home/InformationPanel";
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import QualityControlAPI from "../api/QualityControlAPI";

class Home extends Component {

  state = {
    fakeCurrentUser: "Lady Pinzón",
    projects: null,
    seeProjects: true,
    seeResources: false,
    seeInfoResource: false,
    showMyProjects: false,
    resourcesByLabel: false,
    resourcesByTimeline: false,
    resourcesByQualityControl: false,
    actualOption: "",
    currentProject: null,
    currentResource: null,
    labelProjects: [],
    labelResources: [],
    labelSearch: false,
    qualityControlObjects: [],
    drawerRight: false,
    options: ["Todos los recursos", "Recursos para control de calidad"]
  };

  viewProject = (project) => {
    console.log("entro a ver proyecto ohhh" + project.name);
    this.setState({
      seeProjects: false,
      seeResources: true,
      seeInfoResource: false,
      currentProject: project,
      labelSearch: false,
    });

  };

  viewResource = (resource) => {
    this.setState({
      seeInfoResource: true,
      currentResource: resource,
      seeProjects: false,
      seeResources: false,
      labelSearch: false,
    });
  };

  showLabelSearch = (resources, projects) => {
    this.setState({
      labelSearch: true,
      seeInfoResource: false,
      seeProjects: false,
      seeResources: false,
      labelProjects: projects,
      labelResources: resources,
    });
  };

  showOption = (option) => {
    console.log("aquiii que es option: ", option);
    if (option.toString() === "Todos los proyectos") {
      this.setState({
        seeProjects: true,
        showMyProjects: false,
        seeResources: false,
        resourcesByLabel: false,
        resourcesByTimeline: false,
        resourcesByQualityControl: false,
      });
    }
    else if (option.toString() === "Mis proyectos") {
      this.setState({
        showMyProjects: true,
        seeProjects: false,
        seeResources: false,
        resourcesByLabel: false,
        resourcesByTimeline: false,
        resourcesByQualityControl: false,
      });
    }
    else if (option.toString() === "Todos los recursos") {
      this.setState({
        seeResources: true,
        showMyProjects: false,
        seeProjects: false,
        resourcesByLabel: false,
        resourcesByTimeline: false,
        resourcesByQualityControl: false,
      });
    }
    else if (option.toString() === "Recursos por labels") {
      this.setState({
        resourcesByLabel: true,
        showMyProjects: false,
        seeProjects: false,
        seeResources: false,
        resourcesByTimeline: false,
        resourcesByQualityControl: false,
      });
    }
    else if (option.toString() === "Recursos por linea de tiempo") {
      this.setState({
        resourcesByTimeline: true,
        showMyProjects: false,
        seeProjects: false,
        seeResources: false,
        resourcesByLabel: false,
        resourcesByQualityControl: false,

      });
    }
    else if (option.toString() === "Recursos para control de calidad") {
      console.log("entre a recursos control de calida");
      this.setState({
        resourcesByQualityControl: true,
        resourcesByTimeline: false,
        showMyProjects: false,
        seeProjects: false,
        seeResources: false,
        resourcesByLabel: false,
      }, ()=>{
        QualityControlAPI.getQualityControlByPerson(2,(response)=>{
          console.log("recibi respuesta" + response.data.objects);
          this.setState({
            qualityControlObjects: response.data.objects
          })
        })
      });
    }

  };
  changeProfile= () => {
    this.setState({
      fakeCurrentUser: this.state.fakeCurrentUser==='Lady Pinzón'? 'Orlando Sabogal': 'Lady Pinzón'
    });
  };

  toggleDrawer = (side, open) => {
    this.setState({
      [side]: open
    });
  };

  render() {
    return (
      <div className="home">
        <div className="home__bar">
          <div className="home__bar-title">Gestired</div>
          <div className="home__data-container">
            <div className="home__bar-user-name">{this.state.fakeCurrentUser}</div>
            <div className="home__menu-container">
              <img src="/images/menu-logo.png" className="home__menu" onClick={()=>this.toggleDrawer('drawerRight', true)}/>
            </div>
          </div>
        </div>
        <Options showOption={this.showOption} options={this.state.options} showLabelSearch={this.showLabelSearch}/>
        <Card className="home__information-card">
          <div className="home__navigation-info">
            {this.state.seeProjects ? "Recursos" : (this.state.seeResources ? ("Artefactos del recurso "+ this.state.currentProject.name) :
              (this.state.seeInfoResource ? ("Artefacto de "+ this.state.currentResource.name): "Resultado de la búsqueda"))}
          </div>
          {console.log("lalaal"+this.state.seeResources)}
          {
            // this.state.resourcesByQualityControl ? <InformationPanel content="resourcesByQualityControl" viewProject={this.viewProject}
            //                                                          currentProject={this.state.currentProject}
            //                                                          currentResource={this.state.currentResource}
            //                                                          resourcesByQualityControl = {this.state.qualityControlObjects}
            //                                                          fakeCurrentUser ={this.state.fakeCurrentUser}/>
            //   :
            (this.state.seeProjects ? <InformationPanel content="projects" viewProject={this.viewProject}
                                                      currentProject={this.state.currentProject}
                                                      currentResource={this.state.currentResource}
                                                      fakeCurrentUser ={this.state.fakeCurrentUser}/>
            : (
              this.state.seeResources ? <InformationPanel content="resources" viewResource={this.viewResource}
                                                          currentProject={this.state.currentProject}
                                                          currentResource={this.state.currentResource}
                                                          fakeCurrentUser ={this.state.fakeCurrentUser}/>
                :
                (this.state.seeInfoResource ? <InformationPanel content="oneResource" viewResource={this.viewResource}
                                                                currentProject={this.state.currentProject}
                                                                currentResource={this.state.currentResource}
                                                                fakeCurrentUser ={this.state.fakeCurrentUser}/>
                    :

                    <InformationPanel content="labels" viewResource={this.viewResource} viewProject={this.viewProject}
                                        currentProject={this.state.currentProject}
                                        currentResource={this.state.currentResource}
                                        labelResourcesFound={this.state.labelResources}
                                        labelProjectsFound={this.state.labelProjects}
                                        fakeCurrentUser ={this.state.fakeCurrentUser}/>

                )
            ))}
        </Card>
        <Drawer anchor="right" open={this.state.drawerRight} onClose={()=>this.toggleDrawer('drawerRight', false)}>
        <div
          tabIndex={0}
          role="button"
          onClick={()=>this.toggleDrawer('drawerRight', false)}
          onKeyDown={()=>this.toggleDrawer('drawerRight', false)}
          className="home__change-profile"
        >
          <Button variant="outlined" className="home_button-change-profile" onClick={this.changeProfile}>
            Cambiar Perfil
          </Button>
        </div>
      </Drawer>
      </div>);

  }
}

export default Home;