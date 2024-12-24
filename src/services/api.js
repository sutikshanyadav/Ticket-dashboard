import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/ticketm/api/records';

export const getRecords = () => axios.get(API_BASE_URL);
export const addRecord = (data) => axios.post(API_BASE_URL, data);
export const updateRecord = (id, data) => axios.patch(`${API_BASE_URL}/${id}`, data);
