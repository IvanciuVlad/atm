import {UIStore} from "../store/UIStore";
import {Marker, Popup} from "react-leaflet";
import {Badge} from "react-bootstrap";
import L, {LatLngExpression} from "leaflet";
import "leaflet/dist/leaflet.css";
import 'bootstrap/dist/css/bootstrap.min.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Icon needs to be added to leaflet, anchor must be set such that the marker point correctly at
// the coordinate when zoomed in
const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [13, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const humanize = require('humanize-plus');

/**
 * Iterates through the airport array and displays a marker for each one with badge containing information
 */
export const RenderMarkers = ():JSX.Element => {
    const airportData = UIStore.useState(s => s.airport);

    return <>
        {
            airportData.map(airport => {
                const airportPosition: LatLngExpression = [airport.lat, airport.lng];
                return (
                    <Marker position={airportPosition} icon={DefaultIcon}>
                        <Popup>
                            <h4>
                                {airport.name}
                                <br/>
                                <Badge variant="primary">{airport.ICAO}</Badge>
                            </h4>

                            {humanize.compactInteger(airport.passengers, 2)} passengers in 2019
                        </Popup>
                    </Marker>
                );
            })
        }
    </>;
}
