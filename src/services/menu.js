import axios from 'axios';

class MenuDataService {
    getMenu() {
        return axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/v1/chefyang/menu`);
    }

    getCart(userId) {
        return axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/v1/chefyang/cart/${userId}`);
    }

    upsertCart(data) {
        return axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/v1/chefyang/cart`, data);
    }
}

export default new MenuDataService();