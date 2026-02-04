// singleton to hold recording state across pages
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
        if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    },

    getChunks() {
        return this.chunks;
    }
};