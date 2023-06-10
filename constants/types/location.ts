export type LocationObject = {
    /**
     * The coordinates of the position.
     */
    coords: LocationObjectCoords;
    /**
     * The time at which this position information was obtained, in milliseconds since epoch.
     */
    timestamp: number;
    /**
     * Whether the location coordinates is mocked or not.
     * @platform android
     */
    mocked?: boolean;
};

export type LocationObjectCoords = {
    /**
     * The latitude in degrees.
     */
    latitude: number;
    /**
     * The longitude in degrees.
     */
    longitude: number;
    /**
     * The altitude in meters above the WGS 84 reference ellipsoid. Can be `null` on Web if it's not available.
     */
    altitude: number | null;
    /**
     * The radius of uncertainty for the location, measured in meters. Can be `null` on Web if it's not available.
     */
    accuracy: number | null;
    /**
     * The accuracy of the altitude value, in meters. Can be `null` on Web if it's not available.
     */
    altitudeAccuracy: number | null;
    /**
     * Horizontal direction of travel of this device, measured in degrees starting at due north and
     * continuing clockwise around the compass. Thus, north is 0 degrees, east is 90 degrees, south is
     * 180 degrees, and so on. Can be `null` on Web if it's not available.
     */
    heading: number | null;
    /**
     * The instantaneous speed of the device in meters per second. Can be `null` on Web if it's not available.
     */
    speed: number | null;
};
