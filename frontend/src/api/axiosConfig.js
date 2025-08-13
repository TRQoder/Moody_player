import axios from "axios"
const instance = axios.create({
    baseURL : "https://moody-player-a7c1.onrender.com"
})

export default instance