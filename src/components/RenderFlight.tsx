import {LatLngExpression} from "leaflet";
import {UIStore} from "../store/UIStore";
import {Polyline} from "react-leaflet";

type RenderFlightProps = {
    adepid: number,
    adesid: number,
    flightDistance: number
}

const blackOptions = {color: 'black'};
const radiusWGS84 = 6371.009; // KM
const f = 0.01; // fraction between the 2 points representing the airports, lower number => better precision

/**
 *
 * @param props takes the airport id of the destination and arrival
 * draws the orthodrome on the map by approximating it with 100 loxodromes
 */
export const RenderFlights = (props: RenderFlightProps): JSX.Element => {
    const airportData = UIStore.useState(s => s.airport);
    const lat1: number = airportData[props.adepid].lat * Math.PI / 180;
    const long1: number = airportData[props.adepid].lng * Math.PI / 180;

    const lat2: number = airportData[props.adesid].lat * Math.PI / 180;
    const long2: number = airportData[props.adesid].lng * Math.PI / 180;

    const delta = props.flightDistance / radiusWGS84;

    function drawOrthodrome():JSX.Element {

        const orthodromePolyline: LatLngExpression[] = [
            [airportData[props.adepid].lat, airportData[props.adepid].lng],
            [airportData[props.adesid].lat, airportData[props.adesid].lng],
        ]
        for(let idx = 0; idx < 1; idx += f) {
            const a = Math.sin((1-idx)*delta) / Math.sin(delta)
            const b = Math.sin(idx*delta) / Math.sin(delta)

            const x = a * Math.cos(lat1) * Math.cos(long1) + b * Math.cos(lat2) * Math.cos(long2);
            const y = a * Math.cos(lat1) * Math.sin(long1) + b * Math.cos(lat2) * Math.sin(long2);
            const z = a * Math.sin(lat1) + b * Math.sin(lat2);
            const phi = Math.atan2(z, Math.sqrt(x ** 2 + y ** 2)) * 180 / Math.PI;
            const lambda = Math.atan2(y, x) * 180 / Math.PI;
            orthodromePolyline.splice(orthodromePolyline.length-1, 0, [phi, lambda]);
        }
        //console.log("Polyline: ");
        //console.log(orthodromePolyline);
        return <>
            {
                <Polyline pathOptions={blackOptions} positions={orthodromePolyline}/>
            }
        </>;
    }

    return (
        <div>
            {drawOrthodrome()}
        </div>

    )
}
