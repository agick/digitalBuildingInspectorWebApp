function getNormalizedGeometryPositionArray(geometry){
    const boundingBox = getGeometryBoundingBox(geometry);
    let positions = geometry.getAttribute('position').array;
    const count = geometry.getAttribute('position').count;
    const itemSize = geometry.getAttribute('position').itemSize;
    const min_x = boundingBox.min[0];
    const min_y = boundingBox.min[1];
    const min_z = boundingBox.min[2];

    for (let vert = 0; vert < count; vert++) {
        let i = vert*itemSize;
        positions[ i ] = positions[ i ]-min_x;
        positions[ i+1 ] = positions[ i+1]-min_y;
        positions[ i+2 ] = positions[ i+2 ]-min_z;
    }

    return positions;
}