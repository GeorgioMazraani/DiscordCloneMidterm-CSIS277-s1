const getToken = () => {
    return localStorage.getItem("token");
};

const getTokenBearer = () => {
    const token = getToken();
    return token ? `Bearer ${token}` : "";
};

module.exports = {
    getToken,
    getTokenBearer,
};
