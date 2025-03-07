let video;
let handPose;
let hands = []; // save hands info as an array
let faceMesh;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false,  flipHorizontal: true };

// model
let scene, camera, renderer, model, loader;
let glbmodelLoaded = false;
let stage1;

// sound
let listener, sound;

let hexSize = 8;

let gears = [];
let gearSrc = "assets/gif/gear.webp";

// bring ml5 library: https://ml5js.org
function preload() {
    handPose = ml5.handPose({ flipped: true });
    faceMesh = ml5.faceMesh(options);
}

function gotHands(results) {
    hands = results;
}
function gotFaces(results) {
    // Save the output to the faces variable
    faces = results;
}

function setupAudio() {
    listener = new THREE.AudioListener();
    camera.add(listener); // 🔹 카메라에 오디오 리스너 추가 (3D 사운드 효과)

    sound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('./assets/sounds/gear_spin.mp3', function(buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true); // 🔹 반복 재생 가능
        sound.setVolume(0.3); // 🔹 초기 볼륨 설정
    });
}

function playSound(d) {
    if (!sound.isPlaying) {
        sound.play(); // 🔹 소리 재생
    }
    let volume = map(d, 0, 100, 1, 0); // 🔹 거리에 따라 볼륨 조정
    sound.setVolume(volume);
}

function stopSound() {
    if (sound.isPlaying) {
        sound.stop(); // 🔹 소리 정지
    }
}

setInterval(spawnGear, 3000);

function setup() {
    createCanvas(600, 450);
    // cnv.style("position", "absolute");
    // cnv.style("z-index", "5");
    video = createCapture(VIDEO, {  flipped: true });
    video.size(600, 450);
    video.hide();
    handPose.detectStart(video, gotHands);
    faceMesh.detectStart(video, gotFaces);

    // setInterval(spawnGear, 3000);

    // setInterval(spawnRandomGif, 2000); 
    // Three.js start
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    // camera.position.z = 5;
    camera.position.set(0, 0, 5);

    setupAudio();

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(windowWidth, windowHeight);
    document.body.appendChild(renderer.domElement);

    let directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    let ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    loader = new THREE.GLTFLoader();
    loader.load('./assets/model/allStages.glb', function (gltf) {
        model = gltf.scene;
        // console.log("Scene Hierarchy:", model);
        // model.children.forEach(child => console.log("Object Name:", child.name));
        stage1 = model.getObjectByName("Stage1_Empty"); // 🔹 stage1_empty Collection 찾기
        if (stage1) {
            scene.add(stage1);
            stage1.visible = false;
            stage1.scale.set(0.5, 0.5, 0.5);
            stage1.position.set(0, -1, -3);
            glbmodelLoaded = true;
        } else {
            console.error("Stage1_empty not found in scene");
        }
    });

    gearAnimate();
}

function hexagonMosaic(face) {
    for (let keypoint of face.keypoints) {
      let x = keypoint.x;
      let y = keypoint.y;
  
      // 중앙 색상 샘플링
      let col = get(x, y);
  
      // 육각형 그리기
      drawMetalHexagon(x, y, hexSize, col);
    }
  }

  function drawMetalHexagon(x, y, size, col) {
    fill(col);
    noStroke();
    beginShape();
    for (let i = 0; i < 6; i++) {
        let angle = TWO_PI / 6 * i;
        let vx = x + cos(angle) * size;
        let vy = y + sin(angle) * size;
        vertex(vx, vy);
    }
    endShape(CLOSE);
}
function gearAnimate() {
    requestAnimationFrame(gearAnimate);
    if (glbmodelLoaded) {
        stage1.rotation.z += 0.01; // 모델이 천천히 회전
    }
    renderer.render(scene, camera);
}

function spawnGear() {
    let gearX, gearY;
    let gearSize = random(50, 150); // ✅ 랜덤 크기 적용

    let screenWidth = window.innerWidth;
    let screenHeight = window.innerHeight;

    let centerXMin = screenWidth * 0.3;
    let centerXMax = screenWidth * 0.7;
    let centerYMin = screenHeight * 0.3;
    let centerYMax = screenHeight * 0.7;

    let maxAttempts = 10;
    let attempt = 0;

    do {
        gearX = random(0, screenWidth);
        gearY = random(0, screenHeight);
        attempt++;
    } while (
        (gearX > centerXMin && gearX < centerXMax && 
         gearY > centerYMin && gearY < centerYMax) ||
        attempt > maxAttempts
    );

    let newGear = createImg(gearSrc, "Gear Image"); // ✅ GIF 생성
    newGear.position(gearX, gearY);
    newGear.style("width", `${gearSize}px`);
    newGear.style("height", `${gearSize}px`);
    newGear.style("position", "absolute"); 
    newGear.style("z-index", "10"); 
    newGear.style("pointer-events", "none"); 

    let gearObject = { img: newGear };

    gears.push(gearObject);

    // ✅ 기어 삭제를 예약하는 `setTimeout()`
    let timeoutID = setTimeout(() => {
        if (gears.includes(gearObject)) {
            gearObject.img.remove();
            gears = gears.filter(g => g !== gearObject);
        }
    }, 15000);

    // ✅ `clearGears()` 실행 시 예약된 삭제 취소
    gearObject.timeoutID = timeoutID;
}

function clearGears() {
    // ✅ 모든 기어(GIF) 삭제
    for (let gear of gears) {
        if (gear.img) {
            clearTimeout(gear.timeoutID); // ✅ `setTimeout()` 취소
            gear.img.remove(); // ✅ 즉시 삭제
        }
    }
    gears.length = 0;

    gears = []; // ✅ 배열 초기화 (완전 리셋)

    console.log("All gears removed! Resetting...");
}

function detectHandMotion() {
    if (hands.length > 0) {
        let hand = hands[0]; // 첫 번째 손 정보 가져오기
        let palmWidth = dist(hand.thumb_tip.x, hand.thumb_tip.y, hand.pinky_finger_tip.x, hand.pinky_finger_tip.y);

        if (palmWidth > 200) { // ✅ 손가락을 크게 펼쳤을 때 (손가락 간 거리)
            clearGears();
        }
    }
}

function detectFaceMotion() {
    if (faces.length > 0) {
        let face = faces[0];
        let mouthTop = face.keypoints[13]; // 입 위쪽
        let mouthBottom = face.keypoints[14]; // 입 아래쪽
        let mouthOpen = dist(mouthTop.x, mouthTop.y, mouthBottom.x, mouthBottom.y);

        if (mouthOpen > 30) { // ✅ 입을 크게 벌렸을 때
            clearGears();
        }
    }
}

function draw() {

    image(video, 0, 0);

    for (let gear of gears) {
        push();
        translate(gear.x + gear.size / 2, gear.y + gear.size / 2);
        rotate(gear.angle);
        image(gear.img, -gear.size / 2, -gear.size / 2, gear.size, gear.size);
        pop();

        gear.angle += 0.05; // ✅ 기어 회전 속도 조정
    }

    detectHandMotion(); // ✅ 손 동작 감지
    detectFaceMotion();
    // for (let i = 0; i < faces.length; i++) {
    //     let face = faces[i];
    //     hexagonMosaic(face);
    // }

    if (hands.length === 0) {
        stage1.visible = false;
        stopSound();
        vari.textContent = ``;
        return;
    }

  if (hands.length > 0) {
    //======================================================================
    let right1 = null, right2 = null, right3, right4, right5;
    let left1, left2, left3, left4, left5;

    for (let hand of hands) {
        if (hand.handedness === "Right") {
            right1 = hand.thumb_tip;
            right2 = hand.index_finger_tip;
            right3 = hand.middle_finger_tip;
            right4 = hand.ring_finger_tip;
            right5 = hand.pinky_finger_tip;
        } else if (hand.handedness === "Left") {
            // console.log("Hands Detected:");
            // console.log("Hand Landmarks:", hand.landmarks);
            left1 = hand.thumb_tip;
            left2 = hand.index_finger_tip;
            left3 = hand.middle_finger_tip;
            left4 = hand.ring_finger_tip;
            left5 = hand.pinky_finger_tip;
        }
    }

    if (!right1 || !right2) {
        stage1.visible = false;
        stopSound();
        return;
    }

    //======================================================================
    if (right1 && right2) {
        // Get the distance between right1 and right2
        let d = dist(right1.x, right1.y, right2.x, right2.y);

        if (d < 50 && glbmodelLoaded && stage1) {
            stage1.visible = true; 
            ///// TODO //// NEED TO CHANGE HERE
            //===============================================================
            // Text Position
            //===============================================================
            let x = (right1.x + right2.x) * 0.5;
            let y = (right1.y + right2.y) * 0.5;
            playSound(d);
            // vari.style.top = `${y}px`;
            // vari.style.left = `${x}px`;
            stage1.position.set(map(x, 0, width, -4, 4), map(y, 0, height, 3, -3), -3);
            vari.textContent = ``;
        } else {
            stage1.visible = false; 
            vari.textContent = ``;
            stopSound();
        }
    } else {
        stage1.visible = false; 
    }

    //======================================================================
    if (right2 && left2) {
      let d = dist(right2.x, right2.y, left2.x, left2.y);
      if (d < windowWidth) {
        //===============================================================
        // Text Content
        //===============================================================
        vari.textContent = `Cogs and Gears`;

        //===============================================================
        // Text Position
        //===============================================================
        let x = (right2.x + left2.x) * 0.5;
        let y = (right2.y + left2.y) * 0.5;
        vari.style.top = `${y}px`;
        vari.style.left = `${x}px`;

        //===============================================================
        // Font Variation Settings
        //===============================================================
        // wdth: Width (25~151)
        // Adjust the style from narrower to wider
        // XTRA: Parametric Counter Width (323~603)
        vari.style.fontVariationSettings = `"wdth" ${d}, "XTRA" ${d}`;

        //===============================================================
        // Font Size
        //===============================================================
        vari.style.fontSize = `${d}px`;

        //===============================================================
        // Font Color
        //===============================================================
        vari.style.top = `${y}px`;
        vari.style.left = `${x}px`;

                //===============================================================
        // Font Color
        //===============================================================
        // map: Re-maps a number from one range to another.
        // map(value, start1, stop1, start2, stop2);
        let colorValue = map(d, 0, 100, 38, 0);
        colorValue = constrain(colorValue, 0, 255);
        // // vari.style.color = `white`;
        vari.style.color = `rgb(87, 63, ${d})`;
        // vari.style.color = `rgb(255, 255, ${colorValue})`;

        //===============================================================
        // Font Rotation
        //===============================================================
        // vari.style.transform = `translate(-50%, -50%) rotate(${d}deg)`;
        stage1.visible = false;
      } else {
        vari.textContent = ``;
      }
    } 

    
    //======================================================================
  }
}

// document.addEventListener("DOMContentLoaded", function () {
//     const h1Element = document.getElementById("announce");

//     if (h1Element) {
//         const chars = h1Element.innerText.split(""); // 글자를 개별 문자로 분할
//         h1Element.innerHTML = ""; // 기존 텍스트 제거

//         chars.forEach((char, cIndex) => {  
//             const charSpan = document.createElement("span");
//             charSpan.innerText = char;
//             charSpan.classList.add("char-span");
//             h1Element.appendChild(charSpan);
//         });

//         // 모든 글자에 자동 애니메이션 적용
//         const charSpans = h1Element.querySelectorAll(".char-span");
//         charSpans.forEach((charSpan, cIndex) => {  
//             charSpan.style.animation = `charBounce 2s ${cIndex * 0.1}s infinite alternate ease-in-out`;
//         });
//     }
// });

//======================================================================
// if (left1 && left2) {
//     let d = dist(left1.x, left1.y, left2.x, left2.y);
//     console.log("Yes left1 and left2")
//     if (d < 30) {
//         console.log("Yes left1 and left2 again")
//         //===============================================================
//         // Text Content
//         //===============================================================
//         vari.textContent = `Cogs and Gears`;

//         //===============================================================
//         // Text Position
//         //===============================================================
//         let x = (left1.x + left2.x) * 0.5;
//         let y = (left1.y + left2.y) * 0.5;
//         vari.style.top = `${y}px`;
//         vari.style.left = `${x}px`;

//         //===============================================================
//         // Font Size
//         //===============================================================
//         // vari.style.fontSize = `50px`;
//         vari.style.fontSize = `${d}px`;
//     } else {
//         vari.textContent = ``;
//     }
// }