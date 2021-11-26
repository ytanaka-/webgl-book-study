let gl,
    program,
    squareVertexBuffer,
    squareIndexBuffer,
    indices;

function getShader(id) {
  const script = document.getElementById(id);
  const shaderString = script.text.trim();

  let shader;
  if (script.type === 'x-shader/x-vertex') {
    shader = gl.createShader(gl.VERTEX_SHADER);
  }
  else if (script.type === 'x-shader/x-fragment') {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  }
  else {
    return null;
  }

  gl.shaderSource(shader, shaderString);
  gl.compileShader(shader);

  // Ensure the shader is valid
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

function initProgram() {
  // scirptタグからshaderコードを取得
  const vertexShader = getShader('vertex-shader');
  const fragmentShader = getShader('fragment-shader');

  // Create a program
  // glにおけるプログラムとは？ -> GPUで実行されるコードで、頂点シェーダーとフラグメントシェーダーの組のこと
  program = gl.createProgram();
  // Attach the shaders to this program
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  // プログラムに紐付け
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Could not initialize shaders');
  }
  gl.useProgram(program);
  program.aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
}

// Set up the buffers for the square
function initBuffers() {
  /*
    V0                    V3
    (-0.5, 0.5, 0)        (0.5, 0.5, 0)
    X---------------------X
    |                     |
    |                     |
    |       (0, 0)        |
    |                     |
    |                     |
    X---------------------X
    V1                    V2
    (-0.5, -0.5, 0)       (0.5, -0.5, 0)
  */
  // 頂点配列。3次元の浮動点少数で表現される。ここでは4つある
  const vertices = [
    -0.5, 0.5, 0,
    -0.5, -0.5, 0,
    0.5, -0.5, 0,
    0.5, 0.5, 0
  ];

  // Indices defined in counter-clockwise order
  // インデックスの定義。頂点同士を結んで面を作っている
  indices = [0, 1, 2, 0, 2, 3];

  // Setting up the VBO
  squareVertexBuffer = gl.createBuffer();
  // ARRAY_BUFFERは頂点用のターゲット
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // Setting up the IBO
  squareIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}


function draw() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Use the buffers we've constructed
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexBuffer);
  // VBOを頂点シェーダーのアトリビュートと関連づける
  // 現在bindされているbufferに対して関連付けられる = VBOに関連付けられる
  // program.aVertexPositionというのは52行目で定義した、アトリビュートへのポインタで、第二引数はその要素のサイズがどれだけかを示している
  // おそらく巨大な配列みたいな形式で保管されてて、それを指定するというイメージなのかな
  gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(program.aVertexPosition);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareIndexBuffer);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

// Entry point to our application
function init() {
  const canvas = document.getElementById('webgl-canvas');
  // Set the canvas to the size of the screen
  //canvas.width = window.innerWidth;
  //canvas.height = window.innerHeight;

  // Retrieve a WebGL context
  gl = canvas.getContext('webgl2');
  // Set the clear color to be black
  gl.clearColor(0, 0, 0, 1);

  initProgram();
  initBuffers();
  draw();
}

window.onload = init;