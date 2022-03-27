/* predefined matrices */

_c = (a) => Math.cos(a)
_s = (a) => Math.sin(a)

var _m_i = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
   ]

_m_rotX = (a) => [
   1,     0,      0, 0,
   0, _c(a), -_s(a), 0,
   0, _s(a),  _c(a), 0,
   0,     0,      0, 1
];

_m_rotY = (a) => [
    _c(a), 0, _s(a), 0,
        0, 1,     0, 0,
   -_s(a), 0, _c(a), 0,
        0, 0,     0, 1
];
 
 /* Not used */
// _m_rotZ = (a) => [
//    _Mc(a), -_Ms(a), 0, 0,
//    _Mc(a),  _Ms(a), 0, 0,
//         0,       0, 1, 0,
//         0,       0, 0, 1
// ];

 /* matrix operations */
 
/* multiply 4-element matrix by vector */
m4MV = (m, v) => [
    (v[0] * m[ 0]) + (v[1] * m[ 4]) + (v[2] * m[ 8]) + (v[3] * m[12]),
    (v[0] * m[ 1]) + (v[1] * m[ 5]) + (v[2] * m[ 9]) + (v[3] * m[13]),
    (v[0] * m[ 2]) + (v[1] * m[ 6]) + (v[2] * m[10]) + (v[3] * m[14]),
    (v[0] * m[ 3]) + (v[1] * m[ 7]) + (v[2] * m[11]) + (v[3] * m[15])
]


/* multiply two 4-element matrices */
m4MM = (a, b) => Array().concat(
    m4MV(a, [b[ 0], b[ 1], b[ 2], b[ 3]]),
    m4MV(a, [b[ 4], b[ 5], b[ 6], b[ 7]]),
    m4MV(a, [b[ 8], b[ 9], b[10], b[11]]),
    m4MV(a, [b[12], b[13], b[14], b[15]])
);

/* rotate matrix m by angle a along X */
MrX = (m, a) => m4MM(m, _m_rotX(a));

/* rotate matrix m by angle a along Y */
MrY = (m, a) => m4MM(m, _m_rotY(a));
