let cam;
let poseNet;
let poses;
let mode = 0;
let scaleCanvas = 1.0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  console.log('canvas:', windowWidth, windowHeight);
  scaleCanvas = windowWidth / 640;
  console.log('scaleCanvas:', scaleCanvas);
  // mobile device
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    const camOptions = {
      video: {
        facingMode: {
          exact: "environment" // or "user"
        }
      }
    };
    console.log('mobile device:', navigator.userAgent);
    cam = createCapture(VIDEO, camOptions);
  // desktop
  } else {
    cam = createCapture(VIDEO);
  }
  cam.size(640, 360);
  cam.hide();
  poseNet = ml5.poseNet(cam, modelLoaded); // MobileNetV1 is the default architecture
  poseNet.on('pose', gotPoses);
}

function gotPoses(_poses) {
  if (_poses.length > 0) {
    poses = [_poses[0]]; // only one person
  }
}

function modelLoaded() {
  console.log('poseNet model loaded');
}

function mouseReleased() {
  mode = (mode + 1) % 3;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  scaleCanvas = windowWidth / 640;
}

function draw() {
  push();
  scale(scaleCanvas);
  background(0);
  image(cam, 0, 0);

  if (mode === 0) {
    background(0, 200);
    if (poses) {
      drawFaceLines(poses);
      drawSkeleton(poses);
      drawNeck(poses);
      drawKeypoints(poses);
    }
  } else if (mode === 1) {
    if (poses) {
      drawFaceLines(poses);
      drawSkeleton(poses);
      drawNeck(poses);
      drawKeypoints(poses);
    }
  }
  pop();

  drawGrid();
}

function drawGrid() {
  stroke(100);
  strokeWeight(0.5);
  for (let i = 0; i < width; i += width / 3) {
    line(i, 0, i, height);
  }
  for (let i = 0; i < height; i += height / 3) {
    line(0, i, width, i);
  }
}

function drawNeck(poses) {
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i].pose;
    pose = pose.keypoints.filter((p) => p.part === "leftShoulder" || p.part === "rightShoulder" || p.part === "nose");
    pose = pose.filter((p) => p.score > 0.2);
    let nose = pose.filter((p) => p.part === "nose")[0];
    let leftShoulder = pose.filter((p) => p.part === "leftShoulder")[0];
    let rightShoulder = pose.filter((p) => p.part === "rightShoulder")[0];

    if (nose && leftShoulder && rightShoulder) {
      strokeWeight(8);
      stroke("rgb(0, 0, 255)");
      let neckX = leftShoulder.position.x + (rightShoulder.position.x - leftShoulder.position.x) / 2;
      let neckY = leftShoulder.position.y + (rightShoulder.position.y - leftShoulder.position.y) / 2;
      line(neckX, neckY, nose.position.x, nose.position.y);
      fill("rgb(255, 0, 0)");
      stroke(20);
      strokeWeight(4);
      ellipse(neckX, neckY, 9);
    }
  }
}

function drawFaceLines(poses) {
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i].pose;
    pose = pose.keypoints.filter((p) => p.part === "nose" || p.part === "leftEye" || p.part === "rightEye" || p.part === "leftEar" || p.part === "rightEar");
    pose = pose.filter((p) => p.score > 0.2);
    let nose = pose.filter((p) => p.part === "nose")[0];
    let leftEye = pose.filter((p) => p.part === "leftEye")[0];
    let rightEye = pose.filter((p) => p.part === "rightEye")[0];
    let leftEar = pose.filter((p) => p.part === "leftEar")[0];
    let rightEar = pose.filter((p) => p.part === "rightEar")[0];

    strokeWeight(8);
    if (nose) {
      if (leftEye) {
        stroke("rgb(85, 0, 255)");
        line(nose.position.x, nose.position.y, leftEye.position.x, leftEye.position.y);
      }
      if (rightEye) {
        stroke("rgb(255, 0, 255)");
        line(nose.position.x, nose.position.y, rightEye.position.x, rightEye.position.y);
      }
    }
    if (leftEar && leftEye) {
      stroke("rgb(170, 0, 255)");
      line(leftEar.position.x, leftEar.position.y, leftEye.position.x, leftEye.position.y);
    }
    if (rightEar && rightEye) {
      stroke("rgb(255, 0, 170)");
      line(rightEar.position.x, rightEar.position.y, rightEye.position.x, rightEye.position.y);
    }
  }
}

function drawKeypoints(poses) {
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      let keypoint = pose.keypoints[j];
      if (keypoint.score > 0.2) {
        noFill();
        stroke(20);
        strokeWeight(4);
        ellipse(keypoint.position.x, keypoint.position.y, 9);
      }
    }
  }
}

function drawSkeleton(poses) {
  let boneColors = {
    "leftHip_leftShoulder": "rgba(0, 255, 255, 0.8)",
    "leftElbow_leftShoulder": "rgb(170, 255, 0)",
    "leftElbow_leftWrist": "rgb(85, 255, 0)",
    "leftHip_leftKnee": "rgb(0, 170, 255)",
    "leftAnkle_leftKnee": "rgb(0, 85, 255)",
    "rightHip_rightShoulder": "rgb(85, 255, 0)",
    "rightElbow_rightShoulder": "rgb(255, 170, 0)",
    "rightElbow_rightWrist": "rgb(255, 255, 0)",
    "rightHip_rightKnee": "rgb(0, 255, 85)",
    "rightAnkle_rightKnee": "rgb(0, 255, 170)",
    "leftHip_rightHip": "rgb(255, 85, 0)",
    "leftShoulder_rightShoulder": "rgb(255, 0, 0)",
  }

  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    let pose = poses[i].pose;
    pose = pose.keypoints.filter((p) => p.part === "leftShoulder" || p.part === "rightShoulder" || p.part === "leftHip" || p.part === "rightHip");
    pose = pose.filter((p) => p.score > 0.2);
    let leftShoulder = pose.filter((p) => p.part === "leftShoulder")[0];
    let rightShoulder = pose.filter((p) => p.part === "rightShoulder")[0];
    let leftHip = pose.filter((p) => p.part === "leftHip")[0];
    let rightHip = pose.filter((p) => p.part === "rightHip")[0];

    for (let j = 0; j < skeleton.length; j++) {
      let bone = skeleton[j].sort((a, b) => a.part.localeCompare(b.part));
      let boneName = (bone[0].part + '_' + bone[1].part).trim();
      let partA = bone[0];
      let partB = bone[1];
      stroke("white");
      strokeWeight(7);
      if (boneColors[boneName]) {
        stroke(boneColors[boneName]);
      }
      if (boneName === "leftHip_leftShoulder" || boneName === "rightHip_rightShoulder") {
        if (leftShoulder && rightShoulder) {
          let neckX = leftShoulder.position.x + (rightShoulder.position.x - leftShoulder.position.x) / 2;
          let neckY = leftShoulder.position.y + (rightShoulder.position.y - leftShoulder.position.y) / 2;
          line(partA.position.x, partA.position.y, neckX, neckY);
        }
      } else if (boneName === "leftHip_rightHip") {
        // don't draw it
      } else {
        line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
      }
    }
  }
}
