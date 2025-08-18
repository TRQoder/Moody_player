import axios from "axios"
const instance = axios.create({
    baseURL : "https://moody-player-nxuj.onrender.com",
    
})

export default instance