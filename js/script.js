let currentSong = new Audio(); // making a global varible to store the current song to play
let previousSongLi = new Audio(); // making a global varible to store li 0f the previous song 
let nextSongLi = new Audio(); // making a global varible to store li of  the next song 
let songsLenght;
let isDefaultPlaylist = true;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return `00:00`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formatedMinutes = String(minutes).padStart(2, '0');
    const formatedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formatedMinutes}:${formatedSeconds}`;
}

async function addSongsToSongsList(artist) {
    // all songs are stored at below url, and fatching the resources from the url 
    let a = await fetch(`/songs/${artist}/`); // fatch : fetching a resource from the network
    let response = await a.text(); // The text() method reads the request body and returns it as a promise that resolves with a String.

    let div = document.createElement("div");
    // storing the string of response in div
    div.innerHTML = response;

    // get all <a> tag of div
    let anchors = div.getElementsByTagName("a");

    let songs = [];
    for (let i = 0; i < anchors.length; i++) {
        const element = anchors[i];
        if (element.href.endsWith(".m4a")) {
            // storing the <a> tags that endsWith (".m4a"), means the tags that contains songs
            songs.push(element.href)
        }
    }

    let songsUl = document.querySelector(".songs-list").getElementsByTagName("ul")[0];
    songsUl.innerHTML = ""
    for (const song of songs) {
        // song.split("./songs/${artist}/") will split the array in two parts first part is before "./songs/${artist}/" and second is after "/songs/${artist}/"
        // so take the second part which is song name
        let songName = song.split(`/songs/${artist}/`)[1];

        // now remove "%20" with " "
        songName = songName.replaceAll("%20", " ");

        // discarding ".m4a"
        songName = songName.split(".")[0];

        songsUl.innerHTML = songsUl.innerHTML + `<li>
        <img class="invert-1" src="Assets/music.svg" alt="music">
            <div class="info">
                <div class="song-name"> ${songName}</div>
                <div class="song-artist">${artist.replaceAll("-"," ")}</div>
        </div>
        <div class="play-now">
            <span>Play Now</span>
            <img class="invert-1 play" src="Assets/play.svg" alt="">
        </div>
       </li>`;
    }

    // Attach an event listner to play button(of songs-list) for each song
    let songsArray = Array.from(document.querySelector(".songs-list").getElementsByTagName("li"));
    songsLenght = songsArray.length;
    songsArray.forEach((e) => { // this will traverse all li in songs-list
        e.addEventListener("click", () => {
            setPreviousAndNextSong(artist, e);
        })
    })
}

function getSongNameAndSRC(artist, e) {
    let songName = e.querySelector(".info").querySelector(".song-name").innerHTML;
    let songSRC = `/songs/${artist}/` + songName.trim() + ".m4a";
    return [songName, songSRC];
}

const playMusic = (artist, e, isFirstSong = false) => {
    let songNameAndSRC = getSongNameAndSRC(artist, e);
    currentSong.src = songNameAndSRC[1];
    document.querySelector(".song-info").innerHTML = songNameAndSRC[0];
    document.querySelector(".song-time").innerHTML = `00:00 / 00:00`;

    if (isFirstSong) {
        // setting playBtn.src = play and circle.left = 0, when the song is first or a new playlist is clicked
        playBtn.src = "Assets/play.svg";
        document.querySelector(".circle").style.left = "0";

        // set previousSongLi to last song
        let temp = document.querySelector(".songs-list").querySelectorAll("li")
        previousSongLi = temp[temp.length - 1];
        if (temp.length == 1) {
            // if there's only one song then set that song as next song
            nextSongLi = document.querySelector(".songs-list").querySelector("li")
        } else {
            // nextSongLi to 2nd song
            nextSongLi = e.nextElementSibling;
        }

        if (!isDefaultPlaylist) {
            currentSong.play();
            playBtn.src = "Assets/pause.svg";

        }
    } else {
        // play the song
        currentSong.play();
        playBtn.src = "Assets/pause.svg";
    }
}

function setPreviousAndNextSong(artist, e) {
    if (e == document.querySelector(".songs-list").querySelector("li")) {
        // if clicked song is first song then
        // set previousSongLi to last song
        previousSongLi = document.querySelector(".songs-list").querySelectorAll("li")[songsLenght - 1];
        // nextSongLi to 2nd song  
        nextSongLi = e.nextElementSibling;
    } else if (e == document.querySelector(".songs-list").querySelectorAll("li")[songsLenght - 1]) {
        // if clicked song is last song then
        // set previousSongLi to second-last song
        previousSongLi = document.querySelector(".songs-list").querySelectorAll("li")[songsLenght - 2];
        // nextSongLi to 1st song  
        nextSongLi = document.querySelector(".songs-list").querySelector("li");
    } else {
        // if clicked song is neither last nor last song then
        // set previousSongLi to next  song
        previousSongLi = e.previousElementSibling;
        // nextSongLi to 1st song  
        nextSongLi = e.nextElementSibling;
    }
    // set the current song
    playMusic(artist, e);
}

async function addAlbum() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");

    Array.from(anchors).forEach(async e => {
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/songs/")[1].split("/")[0];
            // get the meta data of the folder 
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();

            let cardContainer = document.querySelector(".card-container");
            cardContainer.innerHTML = cardContainer.innerHTML +
                `<div data-artist="${response.artist}" class="card flex rounded">
                <img class="artist-img rounded-circle" src="/songs/${folder}/cover.png" alt="artist">
                <img class="playButton rounded-circle" src="Assets/playButton.svg" alt="play button">
                <div>${response.title}</div>
                <div>${response.description}</div>
            </div>`;
        }
    })
}

async function main() {
    await addAlbum();

    let artist = "Shubh";

    // get the list of all the songs from the artist folder 
    await addSongsToSongsList(artist);

    // set current song = first song , at beginning 
    playMusic(artist, document.querySelector(".songs-list").querySelector("li"), true);

    // Attach an event listner to play button(of playbar) 
    // elements having an id can directly access it by their id name in js
    playBtn.addEventListener("click", () => {
        if (currentSong.paused) {
            playBtn.src = "Assets/pause.svg";
            currentSong.play();
        } else {
            playBtn.src = "Assets/play.svg";
            currentSong.pause();
        }
    })

    // Attach an event listner to previos button(of playbar) 
    previousBtn.addEventListener("click", () => {
        setPreviousAndNextSong(artist, previousSongLi);
        playBtn.src = "Assets/play.svg";
        setTimeout(() => {
            playBtn.src = "Assets/pause.svg";
        }, 150);
    })

    // Attach an event listner to next button(of playbar) 
    nextBtn.addEventListener("click", () => {
        setPreviousAndNextSong(artist, nextSongLi);
        playBtn.src = "Assets/play.svg";
        setTimeout(() => {
            playBtn.src = "Assets/pause.svg";
        }, 150);
    })

    // listen for timeupdate event 
    currentSong.addEventListener("timeupdate", () => {
        // updating song time 
        document.querySelector(".song-time").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        // moving circle of seekbar 
        document.querySelector(".circle").style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
        // changing pause icon to play icon when song has ended
        if (currentSong.currentTime == currentSong.duration) {
            playBtn.src = "Assets/play.svg";
        }
    })

    // add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let updatedPosition = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = updatedPosition + "%";
        let updatedDuration = (currentSong.duration * updatedPosition) / 100;
        currentSong.currentTime = updatedDuration;
    })

    // add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%"
        document.querySelector(".cross").style.display = "block";
        document.querySelector(".hamburger").style.display = "none";
        document.querySelectorAll(".rounded-circle")[0].style.display = "none";
        document.querySelectorAll(".rounded-circle")[1].style.display = "none";
    })

    // add an event listener for cross
    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
        document.querySelector(".cross").style.display = "none";
        document.querySelector(".hamburger").style.display = "block";
        document.querySelectorAll(".rounded-circle")[0].style.display = "block";
        document.querySelectorAll(".rounded-circle")[1].style.display = "block";
    })

    let previousVolume;
    // add an event lister to volume img (when click set volume to 0 or 50)
    volumeBtn.addEventListener("click", (e) => {
        if (currentSong.volume > 0) {
            previousVolume = currentSong.volume;
            volumeBtn.src = "Assets/mute.svg";
            currentSong.volume = 0;
            document.querySelector(".range").value = 0;
        } else {
            volumeBtn.src = "Assets/volume.svg";
            currentSong.volume = previousVolume;
            document.querySelector(".range").value = previousVolume * 100;
        }
    })

    // add an event lister to range(for setting volume)
    document.querySelector(".range").addEventListener("change", (e) => {
        let vol = parseInt(e.target.value);
        if (vol == 0) {
            volumeBtn.src = "Assets/mute.svg";
        } else {
            volumeBtn.src = "Assets/volume.svg";
        }
        currentSong.volume = vol / 100;
    })

    // load the artist folder whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            artist = item.currentTarget.dataset.artist;
            await addSongsToSongsList(artist);
            isDefaultPlaylist = false;
            playMusic(artist, document.querySelector(".songs-list").querySelector("li"), true);
        })
    })
}

main();
