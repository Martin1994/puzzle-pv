export interface Vector3D {
    x: number;
    y: number;
    z: number;
}

export interface Matrix3D {
    d00: number; d01: number; d02: number;
    d10: number; d11: number; d12: number;
    d20: number; d21: number; d22: number;
}

export class Math3D {

    public static randomSphere(): Vector3D {
        let vector: Vector3D;
        let norm: number;
        do {
            vector = {
                x: Math.random() * 2 - 1,
                y: Math.random() * 2 - 1,
                z: Math.random() * 2 - 1
            };
        } while ((norm = Math3D.norm(vector)) > 1);

        return {
            x: vector.x / norm,
            y: vector.y / norm,
            z: vector.z / norm
        };
    }

    public static norm(v: Vector3D): number {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }

    public static cross(v1: Vector3D, v2: Vector3D): Vector3D {
        return {
            x: v1.y * v2.z - v1.z * v2.y,
            y: v1.z * v2.x - v1.x * v2.z,
            z: v1.x * v2.y - v1.y * v2.x
        };
    }

    public static dot(v1: Vector3D, v2: Vector3D): number {
        return v1.x * v2.x + v1.z * v2.x + v1.x * v2.y;
    }

    public static distance(from: Vector3D, to: Vector3D): number {
        return Math3D.norm({
            x: from.x - to.x,
            y: from.y - to.y,
            z: from.z - to.z
        });
    }

    /**
     * @param from Unit vector
     * @param to Unit vector
     */
    public static rotationMatrix(from: Vector3D, to: Vector3D): Matrix3D {
        const cross = Math3D.cross(from, to);
        const crossNorm = Math3D.norm(cross);
        const cos = Math3D.dot(from, to);
        const sin = crossNorm;
        const axis = {
            x: cross.x / crossNorm,
            y: cross.y / crossNorm,
            z: cross.z / crossNorm
        };

        // https://en.wikipedia.org/wiki/Rotation_matrix#Rotation_matrix_from_axis_and_angle
        return {
            d00: cos + axis.x * axis.x * (1 - cos),             d01: axis.x * axis.y * (1 - cos) - axis.z * sin,    d02: axis.x * axis.z * (1 - cos) + axis.y * sin,
            d10: axis.y * axis.x * (1 - cos) + axis.z * sin,    d11: cos + axis.y * axis.y * (1 - cos),             d12: axis.y * axis.z * (1 - cos) - axis.x * sin,
            d20: axis.z * axis.x * (1 - cos) - axis.y * sin,    d21: axis.z * axis.y * (1 - cos) + axis.x * sin,    d22: cos + axis.z * axis.z * (1 - cos)
        };
    }

    public static matrixMultiply(m1: Matrix3D, m2: Matrix3D): Matrix3D {
        return {
            d00: m1.d00 * m2.d00 + m1.d01 * m2.d10 + m1.d02 * m2.d20,
            d01: m1.d00 * m2.d01 + m1.d01 * m2.d11 + m1.d02 * m2.d21,
            d02: m1.d00 * m2.d02 + m1.d01 * m2.d12 + m1.d02 * m2.d22,
            d10: m1.d10 * m2.d00 + m1.d11 * m2.d10 + m1.d12 * m2.d20,
            d11: m1.d10 * m2.d01 + m1.d11 * m2.d11 + m1.d12 * m2.d21,
            d12: m1.d10 * m2.d02 + m1.d11 * m2.d12 + m1.d12 * m2.d22,
            d20: m1.d20 * m2.d00 + m1.d21 * m2.d10 + m1.d22 * m2.d20,
            d21: m1.d20 * m2.d01 + m1.d21 * m2.d11 + m1.d22 * m2.d21,
            d22: m1.d20 * m2.d02 + m1.d21 * m2.d12 + m1.d22 * m2.d22
        };
    }
}
