import {Store} from "pullstate";
import data from '../data/airports.json';

type AirportData = {
    id: number,
    name: string,
    ICAO: string,
    lat: number,
    lng: number,
    passengers: number
}[];

export type FlightData = {
    id: number,
    adepid: number,
    adesid: number,
    flightDistance: number,
    depTime: number,
    flightTime: number,
    arrTime: number
}[];

type UIStoreProps = {
    airport: AirportData,
    flight: FlightData
}

type Flight = {
    id: number,
    adepid: number,
    adesid: number,
    flightDistance: number,
    depTime: number,
    flightTime: number,
    arrTime: number

};

function calculateOrthodromeDistance(adepid: number, adesid: number, airportData: AirportData): number {
    // Using the Haversine formula
    const radiusWGS84 = 6371.009; // KM

    const lat1:  number = airportData[adepid].lat * Math.PI / 180;
    const lat2:  number = airportData[adesid].lat * Math.PI / 180;

    const delta_phi: number = (airportData[adepid].lat - airportData[adesid].lat) * Math.PI / 180;
    const delta_lambda: number = (airportData[adepid].lng - airportData[adesid].lng) * Math.PI / 180;

    const a = Math.sin(delta_phi/2) * Math.sin(delta_phi/2) +
        Math.cos(delta_phi) * Math.cos(lat1) * Math.cos(lat2) * Math.sin(delta_lambda/2) * Math.sin(delta_lambda/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return radiusWGS84 * c; // in KM
}

const generateFlights =  (noOfFlights: number, airports: AirportData): Flight[] => {
    const flights: Flight[] = [];
    for(let i = 0; i < noOfFlights; i++) {
        const speed = 830; // km/h

        const adepid =  Math.floor(Math.random() * 80);
        const adesid =  Math.floor(Math.random() * 80);
        const flightDistance = Math.floor(calculateOrthodromeDistance(adepid, adesid, airports));

        if (flightDistance < 500)
            continue;

        const depTime = Math.floor(Math.random() * 28800);
        const flightTime = Math.floor(3600 * flightDistance / speed); // in s
        let flight: Flight = {
            id: i,
            adepid:  adepid,
            adesid:  adesid,
            depTime:  depTime,
            flightDistance: flightDistance,
            flightTime: flightTime,
            arrTime: depTime + flightTime
        }
        flights.push(flight);
    }

    return flights;
}

export const UIStore = new Store<UIStoreProps>({
    airport: (data as AirportData),
    flight: (generateFlights(1000, data) as FlightData)
});
