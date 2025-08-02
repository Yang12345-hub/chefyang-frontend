import axios from 'axios';

class MenuDataService {
    getMenu() {
        return axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/v1/chefyang/menu`);
    }
}

export default new MenuDataService();