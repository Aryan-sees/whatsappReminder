const express = require('express');
const { exec } = require('child_process');
const { tmpdir } = require('os');
const { join } = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

app.post('/extract-mp3', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).send("Missing YouTube URL");

  const outputPath = join(tmpdir(), `clip-${Date.now()}.mp3`);
  const cmd = `yt-dlp "${url}" --download-sections "*00:00-01:00" -f bestaudio -x --audio-format mp3 -o "${outputPath}"`;

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error('yt-dlp error:', stderr);
      return res.status(500).send("Failed to process audio.");
    }

    res.download(outputPath, 'clip.mp3', () => fs.unlinkSync(outputPath));
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
