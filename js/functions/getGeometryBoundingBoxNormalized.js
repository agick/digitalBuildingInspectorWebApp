function getGeometryBoundingBox(geometry){
    const itemSize = geometry.getAttribute('position').itemSize;
    const positions = geometry.getAttribute('position').array;
    const count = geometry.getAttribute('position').count;

    let min_x = positions[0];
    let min_y = positions[1];
    let min_z = positions[2];

    let max_x = positions[0];
    let max_y = positions[1];
    let max_z = positions[2];

    for ( let vert = 0; vert < count; vert++ ) {
        let i = vert*itemSize;
        min_x = (positions[i] < min_x) ? positions[i] : min_x;
        min_y = (positions[i+1] < min_y) ? positions[i+1] : min_y;
        min_z = (positions[i+2] < min_z) ? positions[i+2] : min_z;
        max_x = (positions[i] > max_x) ? positions[i] : max_x;
        max_y = (positions[i+1] > max_y) ? positions[i+1] : max_y;
        max_z = (positions[i+2] > max_z) ? positions[i+2] : max_z;
    }

    return {
        min: [0,0,0],
        max: [max_x-min_x,max_y-min_y,max_z-min_z]
    }
}