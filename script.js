let video;
let handPose;
let hands = []; // save hands info as an array

// bring ml5 library: https://ml5js.org
function preload() {
  handPose = ml5.handPose({ flipped: true });
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.size(640, 480);
  video.hide();
  handPose.detectStart(video, gotHands);
}

function draw() {
  image(video, 0, 0);

  if (hands.length > 0) {
    //======================================================================
    let right1,
      right2,
      right3,
      right4,
      right5,
      left1,
      left2,
      left3,
      left4,
      left5;

    for (let hand of hands) {
      if (hand.handedness === "Right") {
        right1 = hand.thumb_tip;
        right2 = hand.index_finger_tip;
        right3 = hand.middle_finger_tip;
        right4 = hand.ring_finger_tip;
        right5 = hand.pinky_finger_tip;
      } else if (hand.handedness === "Left") {
        left1 = hand.thumb_tip;
        left2 = hand.index_finger_tip;
        left3 = hand.middle_finger_tip;
        left4 = hand.ring_finger_tip;
        left5 = hand.pinky_finger_tip;
      }
    }

    //======================================================================
    if (left2) {
        let d = dist(left1.x, left1.y, left2.x, left2.y);
        if (d < 300) {
        //===============================================================
        // Text Content
        //===============================================================
        vari.textContent = `Cogs and Gears`;

        //===============================================================
        // Text Position
        //===============================================================
        let x = (left1.x + left2.x) * 0.5;
        let y = (left1.y + left2.y) * 0.5;
        vari.style.top = `${y}px`;
        vari.style.left = `${x}px`;

        //===============================================================
        // Font Variation Settings
        //===============================================================

        //===============================================================
        // Font Size
        //===============================================================
        // vari.style.fontSize = `50px`;
        vari.style.fontSize = `${d}px`;


        }
            else
        {
            vari.textContent = ``;
        }
    }

    //======================================================================
    if (right1 && right2) {
      let d = dist(right1.x, right1.y, right2.x, right2.y);
      if (d < 30) {
        //===============================================================
        // Text Content
        //===============================================================
        vari.textContent = `❤️`;

        //===============================================================
        // Text Position
        //===============================================================
        let x = (right1.x + right2.x) * 0.5;
        let y = (right1.y + right2.y) * 0.5;
        vari.style.top = `${y}px`;
        vari.style.left = `${x}px`;

        //===============================================================
        // Font Variation Settings
        //===============================================================
        vari.style.fontVariationSettings = `"YOPQ" ${d}`;

        //===============================================================
        // Font Size
        //===============================================================
        vari.style.fontSize = `calc(${d}px * 10)`;
      } else {
        vari.textContent = ``;
      }
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
      } else {
        vari.textContent = ``;
      }
    }

    //======================================================================
  }
}
