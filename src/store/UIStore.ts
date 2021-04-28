import {Store} from "pullstate";
import data from '../data/airports.json';

const departureTimeSeparation = 300;

export type AirportData = {
    id: number,
    name: string,
    ICAO: string,
    lat: number,
    lng: number,
    passengers: number
}[];

export type Flight = {
    id: number,
    adepid: number,
    adesid: number,
    flightDistance: number,
    depTime: number,
    flightTime: number,
    arrTime: number

};

export type FlightData = Flight[];

type UIStoreProps = {
    airport: AirportData,
    flight: FlightData
}

function calculateOrthodromeDistance(adepid: number, adesid: number, airportData: AirportData): number {
    // Using the Haversine formula
    const radiusWGS84 = 6371.009; // KM
    // transforming to radians
    const lat1: number = airportData[adepid].lat * Math.PI / 180;
    const lat2: number = airportData[adesid].lat * Math.PI / 180;

    // calculating the delta between the coordinates
    const delta_phi: number = (airportData[adepid].lat - airportData[adesid].lat) * Math.PI / 180;
    const delta_lambda: number = (airportData[adepid].lng - airportData[adesid].lng) * Math.PI / 180;

    const a = Math.sin(delta_phi / 2) * Math.sin(delta_phi / 2) +
        Math.cos(delta_phi) * Math.cos(lat1) * Math.cos(lat2) * Math.sin(delta_lambda / 2) * Math.sin(delta_lambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return radiusWGS84 * c; // in KM
}

const chooseWeightedAirport = (): number => {
    // const totalPassengers = 1750178446; // total number of passengers on the airports chosen
    // weight for each airport
    const weights = [0.04621619537, 0.04350985305, 0.04097133305, 0.04031364468, 0.03527299581, 0.03010339553,
        0.02971652412, 0.02824771675, 0.02739226283, 0.02661144988, 0.0248732197, 0.0188024673, 0.01819988646,
        0.01809083472, 0.01800255972, 0.01781132665, 0.01728778175, 0.01698176724, 0.01677970442, 0.01648191878,
        0.01633697356, 0.01614254653, 0.01606938542, 0.01506132307, 0.01465147914, 0.01461224143, 0.01457426587,
        0.01384291416, 0.01371375648, 0.01249077318, 0.0113452997, 0.01118815173, 0.01078135892, 0.01040688225,
        0.01024274356, 0.01017319122, 0.009889718982, 0.009240999989, 0.009206377805, 0.008719271475, 0.008597888995,
        0.00841855071, 0.008403357974, 0.00827654062, 0.007917625218, 0.007488950644, 0.007268653679,
        0.007225809476, 0.007067004526, 0.006707658883, 0.00660595154, 0.006523583367, 0.006205120412, 0.005841183237,
        0.005800404538, 0.005496710362, 0.00537426342, 0.005196510688, 0.005147475116, 0.005119294561, 0.005052749918,
        0.004879161333, 0.004805691111, 0.00469920654, 0.004659887692, 0.004479117554, 0.004455763935, 0.004401342627,
        0.004310687871, 0.004176882087, 0.004141189155, 0.004129528058, 0.00406078364, 0.00400992654, 0.003940773591,
        0.003874345508, 0.003811817598, 0.00375446516, 0.003717236385, 0.00360041344];
    // weights add up to 1; math.random returns a number in the [0,1] interval
    // if condition always triggers, default return is required for TS linter
    let sum = 0;
    const r = Math.random();
    for (let i = 0; i < weights.length; i++) {
        sum += weights[i];
        if (r <= sum)
            return i;
    }
    return 0;
}

export const checkConflicts = (timeInterval: number, flights: FlightData): Record<number, FlightData> => {
    const sameAdesFlights:Record<number, FlightData> = {};
    flights.forEach((flight) => {
        sameAdesFlights[flight.adesid] = [...(sameAdesFlights[flight.adesid] || []), flight];
    });


    const conflicts:Record<number, FlightData> = {};
    for(const adesid in sameAdesFlights) {
        const someFlights = sameAdesFlights[adesid];
        someFlights.sort((a, b) => a.arrTime - b.arrTime);
        // console.log("Some flights", someFlights);
        const conflicted = new Set<Flight>()

        for(let idx = 0; idx < someFlights.length - 1; idx++) {
            if(Math.abs(someFlights[idx].arrTime - someFlights[idx+1].arrTime) < timeInterval) {
                conflicted.add( someFlights[idx] )
                conflicted.add( someFlights[idx+1] )
            }
        }
        
        conflicts[adesid] = [...(conflicts[adesid] || []), ...Array.from(conflicted)];
    }

    // console.log("Conflicts: ", conflicts);

    return conflicts;
}

const checkDepartureConflict = (depTime: number, departures: number[]): boolean => {
    if(departures === [])
        return false;
    departures.sort((a, b) => a - b);
    departures.forEach((time) => {
        if(Math.abs(time - depTime) < departureTimeSeparation) {
            return true;
        }
    })

    return false;
}

const generateFlights = (noOfFlights: number, airports: AirportData): Flight[] => {
    const flights: Flight[] = [];
    const departureByAirport:Record<string, number[]> = {};

    for (let i = 0; i < noOfFlights; i++) {
        const speed = 830; // km/h

        const adepid = chooseWeightedAirport();
        const adesid = chooseWeightedAirport();

        if (adepid === adesid)
            continue;

        const flightDistance = Math.floor(calculateOrthodromeDistance(adepid, adesid, airports));

        // we skip unrealistically short flights
        if (flightDistance < 500)
            continue;

        // depTime is considered randomly in an 8 hour interval, we skip it if it's too close to another flight
        const depTime = Math.floor(Math.random() * 28800);

        if(departureByAirport[adepid] && checkDepartureConflict(depTime, departureByAirport[adepid]))
            continue;

        const flightTime = Math.floor(3600 * flightDistance / speed); // in s
        let flight: Flight = {
            id: i,
            adepid: adepid,
            adesid: adesid,
            depTime: depTime,
            flightDistance: flightDistance,
            flightTime: flightTime,
            arrTime: depTime + flightTime
        }
        flights.push(flight);
        departureByAirport[adepid] = [...(departureByAirport[adepid] || []), depTime];
    }

    return flights;
}

export const UIStore = new Store<UIStoreProps>({
    airport: (data as AirportData),
    flight: (generateFlights(1000, data) as FlightData)
});
