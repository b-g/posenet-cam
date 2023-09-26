let img;
let poseNet;

function preload() {
  img = loadImage('man.png');
}

function setup() {
  createCanvas(640, 360);
  image(img, 0, 0);
  poseNet = ml5.poseNet(modelReady);
}

function draw() {

}

function modelReady() {
  poseNet.on('pose', function (poses) {
    console.log('pose');
    if (poses.length > 0) {
      drawSkeleton(poses);
      drawKeypoints(poses);
    }
  });
  poseNet.singlePose(img);
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
        ellipse(round(keypoint.position.x), round(keypoint.position.y), 9);
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
    for (let j = 0; j < skeleton.length; j++) {
      let bone = skeleton[j].sort((a, b) => a.part.localeCompare(b.part));
      let boneName = (bone[0].part + '_' + bone[1].part).trim();
      let partA = bone[0];
      let partB = bone[1];
      stroke("white");
      if (boneColors[boneName]) {
        stroke(boneColors[boneName]);
      }
      strokeWeight(6);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}
