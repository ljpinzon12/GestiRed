import axios from 'axios';

const baseURL = "https://gestiredback.herokuapp.com";

const createNewPhase = (data, onComplete, onError) => {
  const url = baseURL + "/gestired/phase/";

  axios.post(url, {
    ...data
  })
    .then(onComplete? onComplete : (response) => console.log(response))
    .catch(onError? onError : (error) => console.log(error));
};



const PhasesAPI = {
  createNewPhase,

};

export default PhasesAPI;