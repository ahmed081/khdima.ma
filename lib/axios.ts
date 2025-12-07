// import axios from "axios"
import axios from 'axios';
export const api = axios.create({
    baseURL: "/api",
    withCredentials: true, // send cookies (JWT)
})

// Optional: interceptors for token / error handling
api.interceptors.response.use(
    (res) => res,
    (err) => {
        console.error("API Error:", err.response?.data || err.message)
        return Promise.reject(err)
    }
)
