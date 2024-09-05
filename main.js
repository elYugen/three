import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Variable pour mixer et animations
let mixer;
let model;
let cameraFollowMouse = true;  // Variable pour activer/désactiver le suivi de la souris

// Variables pour gérer le saut
let isJumping = false;
let jumpSpeed = 0.5; // Vitesse du saut
let gravity = -0.02; // Gravité qui fait descendre le modèle
let jumpHeight = 2; // Hauteur maximale du saut
let jumpStartY = 0; // Position Y de départ du saut

// Variable pour le mode libre de la caméra
let freeCameraMode = false;

// Collision
let modelBoundingBox;
let mur1BoundingBox, mur2BoundingBox, mur3BoundingBox, mur4BoundingBox;

// Initialisation de la scène, de la caméra et du renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
camera.position.set(0, 1, 100);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x87CEEB);
document.body.appendChild(renderer.domElement);

// Charger la texture pour le cube
const textureLoader = new THREE.TextureLoader();
const cubeTexture = textureLoader.load('./textures/default.png');

// Cube avec texture
const geometry2 = new THREE.BoxGeometry(30, 0, 30);
const material2 = new THREE.MeshBasicMaterial({ map: cubeTexture });
const cube = new THREE.Mesh(geometry2, material2);
cube.position.set(0, -0, 0);  // position du cube

// Mur1 avec texture
const geometry3 = new THREE.BoxGeometry(0, 5, 30);
const material3 = new THREE.MeshBasicMaterial({ map: cubeTexture });
const mur1 = new THREE.Mesh(geometry3, material3);
mur1.position.set(15, 0, 0);  // position du mur

// Mur2 avec texture
const geometry4 = new THREE.BoxGeometry(0, 5, 30);
const material4 = new THREE.MeshBasicMaterial({ map: cubeTexture });
const mur2 = new THREE.Mesh(geometry4, material4);
mur2.position.set(-15, 0, 0);  // position du mur

// Mur3 avec texture
const geometry5 = new THREE.BoxGeometry(30, 5, 0);
const material5 = new THREE.MeshBasicMaterial({ map: cubeTexture });
const mur3 = new THREE.Mesh(geometry5, material5);
mur3.position.set(0, 0, 15);  // position du mur

// Mur4 avec texture
const geometry6 = new THREE.BoxGeometry(30, 5, 0);
const material6 = new THREE.MeshBasicMaterial({ map: cubeTexture });
const mur4 = new THREE.Mesh(geometry6, material6);
mur4.position.set(0, 0, -15);  // position du mur

scene.add(cube, mur1, mur2, mur3, mur4);

camera.position.z = 5;

// Charger le modèle 3D
const loader = new GLTFLoader();
loader.load('./models/the_witch.glb', function (gltf) {
  model = gltf.scene;  // Stocke le modèle dans la variable globale `model`
  scene.add(model);

  mixer = new THREE.AnimationMixer(model);

  const animations = gltf.animations;
  if (animations && animations.length) {
    const walkAction = mixer.clipAction(animations[0]);
    walkAction.play();
  }
  modelBoundingBox = new THREE.Box3().setFromObject(model);

}, undefined, function (error) {
  console.error(error);
});

// Charger le modèle 3D
const loader2 = new GLTFLoader();
loader2.load('./models/the_witch.glb', function (gltf) {
  model = gltf.scene;  // Stocke le modèle dans la variable globale `model`
  scene.add(model);

  mixer = new THREE.AnimationMixer(model);

  const animations = gltf.animations;
  if (animations && animations.length) {
    const walkAction = mixer.clipAction(animations[0]);
    walkAction.play();
  }
  modelBoundingBox = new THREE.Box3().setFromObject(model);

}, undefined, function (error) {
  console.error(error);
});

// Boîte qui va gérer les murs
mur1BoundingBox = new THREE.Box3().setFromObject(mur1);
mur2BoundingBox = new THREE.Box3().setFromObject(mur2);
mur3BoundingBox = new THREE.Box3().setFromObject(mur3);
mur4BoundingBox = new THREE.Box3().setFromObject(mur4);

const controls = new OrbitControls(camera, renderer.domElement);

// Variables pour gérer les déplacements et la rotation
const move = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  rotateLeft: false,
  rotateRight: false
};

// Variable pour stocker les coordonnées de la souris
let mouse = {
  x: 0,
  y: 0
};

// Suivre le mouvement de la souris
document.addEventListener('mousemove', (event) => {
  if (cameraFollowMouse) {
    // Normaliser les coordonnées de la souris entre -1 et 1
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }
});

// Gérer les événements de clavier
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    cameraFollowMouse = !cameraFollowMouse;  // Inverser l'état du suivi de la souris

    if (cameraFollowMouse) {
      isPaused = false;
      pauseModal.style.display = 'none';  
    } else {
      isPaused = true;
      pauseModal.style.display = 'flex';  
    }
  }
  if (event.key === ' ') { // Touche espace pour le saut
    if (!isJumping && model.position.y === 0) { // Vérifier si le modèle est au sol
      isJumping = true;
      jumpStartY = model.position.y; // Enregistrer la position Y de départ du saut
      jumpSpeed = 0.5; // Réinitialiser la vitesse du saut
    }
  }

  if (event.key === 'Control') { // Touche Ctrl pour le mode libre
    freeCameraMode = true;
  }

  if (model) {  // Vérifier que le modèle est chargé avant de l'utiliser
    switch (event.key) {
      case 's':  // Avancer
        move.forward = true;
        break;
      case 'z':  // Reculer
        move.backward = true;
        break;
      case 'd':  // Gauche
        move.left = true;
        break;
      case 'q':  // Droite
        move.right = true;
        break;
      case 'ArrowLeft':  // Rotation vers la gauche
        move.rotateLeft = true;
        break;
      case 'ArrowRight':  // Rotation vers la droite
        move.rotateRight = true;
        break;
    }
  }
});



// Écouter les relâchements de touches
document.addEventListener('keyup', (event) => {
  if (event.key === 'Control') { // Relâchement de la touche Ctrl
    freeCameraMode = false;
  }
  switch (event.key) {
    case 's':
      move.forward = false;
      break;
    case 'z':
      move.backward = false;
      break;
    case 'd':
      move.left = false;
      break;
    case 'q':
      move.right = false;
      break;
    case 'ArrowLeft':
      move.rotateLeft = false;
      break;
    case 'ArrowRight':
      move.rotateRight = false;
      break;
  }
});

function checkCollisions() {
  if (modelBoundingBox.intersectsBox(mur1BoundingBox) ||
      modelBoundingBox.intersectsBox(mur2BoundingBox) ||
      modelBoundingBox.intersectsBox(mur3BoundingBox) ||
      modelBoundingBox.intersectsBox(mur4BoundingBox)) {
    return true;  // Collision détectée
  }
  return false;
}

// Fonction pour déplacer le personnage en fonction de sa rotation et des touches pressées
function updateMovement() {
  if (model) {
    const speed = 0.1;
    const rotationSpeed = 0.05;  // Vitesse de rotation
    const direction = new THREE.Vector3();

    if (move.forward) {
      direction.z -= speed;
    }
    if (move.backward) {
      direction.z += speed;
    }
    if (move.left) {
      direction.x -= speed;
    }
    if (move.right) {
      direction.x += speed;
    }

    // Appliquer la direction en fonction de la rotation du modèle
    direction.applyEuler(model.rotation);

    // Calculer la nouvelle position potentielle du modèle
    const nextPosition = model.position.clone().add(direction);

    // Simuler le déplacement en mettant à jour la boîte englobante avec la nouvelle position
    modelBoundingBox.setFromObject(model);
    modelBoundingBox.translate(direction);  // Simuler le déplacement avec la direction

    // Vérifier si une collision se produit avec les murs
    if (!checkCollisions()) {
      // Si pas de collision, appliquer la nouvelle position
      model.position.add(direction);
    }

    // Appliquer la rotation au modèle
    if (move.rotateLeft) {
      model.rotation.y += rotationSpeed;
    }
    if (move.rotateRight) {
      model.rotation.y -= rotationSpeed;
    }

    // Mettre à jour la boîte englobante après la rotation
    modelBoundingBox.setFromObject(model);

    // Gérer le saut
    if (isJumping) {
      model.position.y += jumpSpeed; // Déplacer le modèle vers le haut

      // Vérifier si le modèle a atteint la hauteur maximale du saut
      if (model.position.y >= jumpStartY + jumpHeight) {
        jumpSpeed = -Math.abs(jumpSpeed); // Inverser la direction pour redescendre
      }
    }

    // Appliquer la gravité
    if (model.position.y > 0) { // Si le modèle est au-dessus du sol
      model.position.y += gravity;
    } else { // Si le modèle touche le sol
      model.position.y = 0;
      isJumping = false; // Arrêter le saut
      jumpSpeed = Math.abs(jumpSpeed); // Réinitialiser la vitesse du saut
    }
  }
}


// Fonction pour mettre à jour la caméra et le personnage en fonction de la souris
function updateCameraAndModel() {
  if (freeCameraMode) {
    // Mode libre : permet à la caméra d'être contrôlée indépendamment du modèle
    // Utiliser les contrôles de la caméra OrbitControls pour le mode libre
    controls.update();
  } else if (cameraFollowMouse && model) {
    // Mode suivi du modèle
    // Déplacer la caméra avec un léger décalage
    const cameraOffset = new THREE.Vector3(mouse.x * 10, 5, -10);
    const cameraPosition = model.position.clone().add(cameraOffset);
    camera.position.copy(cameraPosition);

    // Faire en sorte que le personnage suive la direction de la souris
    const targetPosition = new THREE.Vector3(mouse.x * 100, 0, mouse.y * 100);
    model.lookAt(targetPosition);

    camera.lookAt(model.position);  // La caméra continue de regarder vers le personnage
  }
}



let isPaused = false;  // Variable pour vérifier si le jeu est en pause

// Obtenir la référence du modal et du bouton reprendre
const pauseModal = document.getElementById('pauseModal');
const resumeButton = document.getElementById('resumeButton');

// Gérer l'événement de clic sur le bouton "Reprendre"
resumeButton.addEventListener('click', () => {
  isPaused = false;
  pauseModal.style.display = 'none'; 
  cameraFollowMouse = true;  // Réactiver le suivi de la souris
});

// Modifier la boucle du jeu pour tenir compte de l'état de pause
function gameLoop() {
  requestAnimationFrame(gameLoop);

  if (!isPaused) {
    updateMovement();
    updateCameraAndModel();  // Mettre à jour la caméra et le personnage en fonction de la souris

    if (mixer) {
      mixer.update(0.01);
    }

    renderer.render(scene, camera);
  }
}

gameLoop();
