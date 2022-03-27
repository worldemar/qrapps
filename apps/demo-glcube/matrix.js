/* predefined matrices */

var _m_i = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
   ]

function _m_rotX(a) {
   c = Math.cos(a)
   s = Math.sin(a)
   return [
        1, 0, 0, 0,
        0, c,-s, 0,
        0, s, c, 0,
        0, 0, 0, 1
   ];
 }

function _m_rotY(a) {
   c = Math.cos(a)
   s = Math.sin(a)
   return [
      c, 0, s, 0,
      0, 1, 0, 0,
     -s, 0, c, 0,
      0, 0, 0, 1
   ];
 }
 
 /* Not used */
 // function _m_rotZ(a) {
 // let c = Math.cos(a)
 // let s = Math.sin(a)
 //   return [
 //     c, -s,    0,    0,
 //     s,  c,    0,    0,
 //          0,       0,    1,    0,
 //          0,       0,    0,    1
 //   ];
 // }
 

 /* matrix operations */
 
/* multiply 4-element matrix by vector */
function mult4MV(m, v) {
  return [
    (v[0] * m[ 0]) + (v[1] * m[ 4]) + (v[2] * m[ 8]) + (v[3] * m[12]),
    (v[0] * m[ 1]) + (v[1] * m[ 5]) + (v[2] * m[ 9]) + (v[3] * m[13]),
    (v[0] * m[ 2]) + (v[1] * m[ 6]) + (v[2] * m[10]) + (v[3] * m[14]),
    (v[0] * m[ 3]) + (v[1] * m[ 7]) + (v[2] * m[11]) + (v[3] * m[15])
  ]
}

/* multiply two 4-element matrices */
function mult4MM(a, b) {
  return Array().concat(
    mult4MV(a, [b[ 0], b[ 1], b[ 2], b[ 3]]),
    mult4MV(a, [b[ 4], b[ 5], b[ 6], b[ 7]]),
    mult4MV(a, [b[ 8], b[ 9], b[10], b[11]]),
    mult4MV(a, [b[12], b[13], b[14], b[15]])
  );
}

/* rotate matrix m by angle a along X */
function rotateX(m, a) {
  r = _m_rotX(a);
  return mult4MM(m, r);
}

/* rotate matrix m by angle a along Y */
function rotateY(m, a) {
  r = _m_rotY(a);
  return mult4MM(m, r);
}
