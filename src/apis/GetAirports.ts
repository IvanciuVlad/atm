function GetAirports() {
    return fetch('../data/airports.json', {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }).then(res => res.json)
        .then(response => {
            console.log(response);
            return response;
        }).catch(error => console.log(error))
}

export default GetAirports;
