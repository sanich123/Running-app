import moment from "moment";

export function formatDuration(duration: number) {
    return moment.utc(moment.duration(duration, "s").asMilliseconds()).format("HH:mm:ss");
}