const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const readline = require('readline');

ffmpeg.setFfmpegPath(ffmpegPath);

async function downloadHlsStream(url, outputFilePath) {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url);
        const playlist = await response.text();

        const segmentUrls = [];
        const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);

        playlist.split('\n').forEach(line => {
            if (line && !line.startsWith('#')) {
                segmentUrls.push(baseUrl + line);
            }
        });

        if (segmentUrls.length === 0) {
            throw new Error('No segments found in the playlist');
        }

        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        const segmentFiles = [];
        for (let i = 0; i < segmentUrls.length; i++) {
            const segmentUrl = segmentUrls[i];
            const segmentFile = path.join(tempDir, `segment${i}.ts`);
            const segmentResponse = await fetch(segmentUrl);
            const segmentBuffer = await segmentResponse.arrayBuffer();
            fs.writeFileSync(segmentFile, Buffer.from(segmentBuffer));
            segmentFiles.push(segmentFile);

            // Show progress
            const progress = ((i + 1) / segmentUrls.length) * 100;
            readline.cursorTo(process.stdout, 0);
            process.stdout.write(`Downloading segments: ${progress.toFixed(2)}%`);
        }
        console.log('\nDownload complete. Starting conversion...');

        const ffmpegCommand = ffmpeg();
        segmentFiles.forEach(file => {
            ffmpegCommand.input(file);
        });

        ffmpegCommand
            .on('error', (err) => {
                console.error('Error during conversion:', err.message);
                cleanup(tempDir);
            })
            .on('progress', (progress) => {
                const percent = progress.percent ? progress.percent.toFixed(2) : 0;
                readline.cursorTo(process.stdout, 0);
                process.stdout.write(`Converting: ${percent}% [${'#'.repeat(Math.floor(percent / 10))}${' '.repeat(10 - Math.floor(percent / 10))}]`);
            })
            .on('end', () => {
                console.log('\nConversion finished successfully');
                cleanup(tempDir);
            })
            .mergeToFile(outputFilePath, tempDir);
    } catch (error) {
        console.error('Error downloading HLS stream:', error.message);
    }
}

function cleanup(tempDir) {
    fs.readdirSync(tempDir).forEach(file => {
        fs.unlinkSync(path.join(tempDir, file));
    });
    fs.rmdirSync(tempDir);
}

// Example usage
const hlsUrl = 'https://www083.vipanicdn.net/streamhls/be44901549f1149ac5838ee8c90f2792/ep.10.1707365530.360.m3u8';
const outputFilePath = 'output.mp4';
downloadHlsStream(hlsUrl, outputFilePath);