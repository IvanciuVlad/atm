import {LatLngExpression} from "leaflet";
//import {UIStore} from "../store/UIStore";
import {Polyline} from "react-leaflet";

type RenderFlightProps = {
    adep: LatLngExpression,
    ades: LatLngExpression,
    flightDistance: number
}

const blackOptions = {color: 'blue'};

/**
 *
 * @param props takes the airport id of the destination and arrival
 * draws the orthodrome on the map by aproximating it with 100 loxodromes
 */
export const RenderFlights = (props: RenderFlightProps): JSX.Element => {
    //const airportData = UIStore.useState(s => s.airport);
    console.log(props);
    const polyline: LatLngExpression[] = [
        props.adep,
        props.ades,
    ];

    return (
        <Polyline pathOptions={blackOptions} positions={polyline}/>
    )
}
