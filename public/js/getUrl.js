export const getUrl = async (url) => {
  let content = document.getElementById('content');
  let res = await fetch('/url', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ videoUrl: url})
  });

  let {nowm, wm, music} = await res.json();

  // mengambil file audio dan membuat blob URL
  let audioResponse = await fetch(music);
  let audioBlob = await audioResponse.blob();
  let audioUrl = URL.createObjectURL(audioBlob);

  // mengambil file video dan membuat blob URL
  let videoResponse = await fetch(nowm);
  let videoBlob = await videoResponse.blob();
  let videoUrl = URL.createObjectURL(videoBlob);

  // menambahkan tombol untuk mengunduh file audio
  let dlaudio = `
    <a href="${audioUrl}" download="audio.mp3" class='btn' rel="noopener noreferrer">Download Audio</a>
  `;

  // menambahkan tombol untuk mengunduh file video
  let dlvideo = `
    <a href="${videoUrl}" download="video.mp4" class='btn' rel="noopener noreferrer">Download Video</a>
  `;

  // menambahkan tag video
  let video = `
    <video controls="" autoplay="" name="media">
      <source src="${videoUrl}" type="video/mp4"></source>
    </video>
  `;

  content.innerHTML = `${dlvideo} ${dlaudio} ${video}`;
}
