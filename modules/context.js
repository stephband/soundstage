
const context = new window.AudioContext();
context.destination.channelInterpretation = "discrete";
context.destination.channelCount = context.destination.maxChannelCount;

if (!context.baseLatency) {
    // Assume 128 * 2 buffer length, as it is in Chrome
    context.baseLatency = 256 / context.sampleRate;
}

if (!context.outputLatency) {
    // Just a quick guess.
    // You'll never get this on Windows, more like 0.02 - no ASIO drivers, see.
    context.outputLatency = 128 / context.sampleRate;
}

export default context;

export function timeAtDomTime(context, domTime) {
    var stamps = context.getOutputTimestamp();
    return stamps.contextTime + (domTime - stamps.performanceTime) / 1000;
}

export function domTimeAtTime(context, time) {
    var stamp = context.getOutputTimestamp();
    return stamp.performanceTime + (time - stamp.contextTime) * 1000;
}
