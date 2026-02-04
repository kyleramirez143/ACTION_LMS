// recorder.js
export const RecorderState = {
    mediaRecorder: null,
    chunks: [],
    stream: null,

    start(mediaStream) {
        this.stream = mediaStream;
        this.chunks = [];

        this.mediaRecorder = new MediaRecorder(mediaStream, { mimeType: "video/webm" });
        this.mediaRecorder.ondataavailable = e => {
            if (e.data && e.data.size > 0) this.chunks.push(e.data);
        };
        this.mediaRecorder.start(1000);
    },

    stop() {
        if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") this.mediaRecorder.stop();
        if (this.stream) {
            this.stream.getTracks().forEach(t => t.stop());
            this.stream = null;
        }
    },

    getChunks() {
        return this.chunks;
    },

    // Added to allow QuizPage to access the track for monitoring
    getStream() {
        return this.stream;
    }
};
