/* predefined matrices */

var _m_i = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
   ]

function _m_rotX(a) {
   let c = Math.cos(a)
   let s = Math.sin(a)
   return [
        1, 0, 0, 0,
        0, c,-s, 0,
        0, s, c, 0,
        0, 0, 0, 1
   ];
 }

function _m_rotY(a) {
   let c = Math.cos(a)
   let s = Math.sin(a)
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
function mult4MM(mA, mB) {
  return Array().concat(
    mult4MV(mA, [mB[ 0], mB[ 1], mB[ 2], mB[ 3]]),
    mult4MV(mA, [mB[ 4], mB[ 5], mB[ 6], mB[ 7]]),
    mult4MV(mA, [mB[ 8], mB[ 9], mB[10], mB[11]]),
    mult4MV(mA, [mB[12], mB[13], mB[14], mB[15]])
  );
}

/* rotate matrix m by angle a along X */
function rotateX(m, a) {
  r = _m_rotX(-a);
  return mult4MM(m, r);
}

/* rotate matrix m by angle a along Y */
function rotateY(m, a) {
  r = _m_rotY(-a);
  return mult4MM(m, r);
}
