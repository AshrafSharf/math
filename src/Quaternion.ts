/**
 * @file Quaternion
 * @see uon.math.Quaternion
 * @author Gabriel Roy <gab@uon.io>
 * @ignore
 */

import { Vector3 } from './Vector3';
import { Vector4 } from './Vector4';
import { Matrix4 } from './Matrix4';

const TEMP_VEC3 = new Vector3();
const ZERO_F32 = Math.fround(0);
const ONE_F32 = Math.fround(0);
const f32 = Math.fround;

/**
 * Quaternion object
 */
export class Quaternion {

    public x: number = ZERO_F32;
    public y: number = ZERO_F32;
    public z: number = ZERO_F32;
    public w: number = ONE_F32;

    private _cache: Float32Array;

	/**
	 * @constructs
	 */
    constructor(x?: any, y?: number, z?: number, w?: number) {


        var v = this;
        if (arguments.length >= 3) {
            this.x = f32(x);
            this.y = f32(y);
            this.z = f32(z);
            this.w = w !== undefined ? f32(w) : ONE_F32;

        } else if (Array.isArray(x)) {
            this.x = f32(x[0]) || ZERO_F32;
            this.y = f32(x[1]) || ZERO_F32;
            this.z = f32(x[2]) || ZERO_F32;
            this.w = f32(x[3]) || ZERO_F32;
        } else if (x instanceof Quaternion) {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
            this.z = x.w;
        }

    }

    set(x: number, y: number, z: number, w: number) {

        this.x = f32(x);
        this.y = f32(y);
        this.z = f32(z);
        this.w = f32(w);

        return this;

    }

    equals(v: Quaternion) {

        return ((v.x === this.x) && (v.y === this.y)
            && (v.z === this.z) && (v.w === this.w));
    }

    negate() {

        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        this.w = -this.w;
        return this;

    }

    toArray() {

        return [this.x, this.y, this.z, this.w];
    }


    copy(q: Quaternion) {

        this.set(q.x, q.y, q.z, q.w);

        return this;
    }

    clone() {

        return new Quaternion(this);
    }

    inverse(result?: Quaternion) {

        var l = this.length();
        result = result || this;
        //result.negate(result);
        result.x /= l;
        result.y /= l;
        result.z /= l;
        result.w /= l;
        return this.conjugate().normalize();
    }

    normalize() {

        var l = this.length();

        if (l === 0) {
            this.x = 0;
            this.y = 0;
            this.z = 0;
            this.w = 1;

        } else {
            l = 1 / l;

            this.x = this.x * l;
            this.y = this.y * l;
            this.z = this.z * l;
            this.w = this.w * l;

        }

        return this;
    }

    length() {

        return Math.sqrt(this.x * this.x + this.y * this.y
            + this.z * this.z + this.w * this.w);
    }

    lengthSq() {

        return this.x * this.x + this.y * this.y + this.z
            * this.z + this.w * this.w;
    }

    conjugate() {

        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;

        return this;
    }

    multiply(b: Quaternion) {

        var a = this;

        var qax = a.x, qay = a.y, qaz = a.z, qaw = a.w;
        var qbx = b.x, qby = b.y, qbz = b.z, qbw = b.w;

        this.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
        this.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
        this.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
        this.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

        return this;
    }

    fromAxisAngle(axis: Vector3, angle: number) {

        var half_angle = angle * 0.5, sinus = Math
            .sin(half_angle), cosinus = Math
                .cos(half_angle);

        this.x = axis.x * sinus;
        this.y = axis.y * sinus;
        this.z = axis.z * sinus;
        this.w = cosinus;

        return this;

    }

    setFromUnitVectors(vFrom: Vector3, vTo: Vector3) {

        // http://lolengine.net/blog/2014/02/24/quaternion-from-two-vectors-final

        // assumes direction vectors vFrom and vTo are
        // normalized

        let v1 = TEMP_VEC3;
        let EPS = 0.000001;

        let r = vFrom.dot(vTo) + 1;

        if (r < EPS) {

            r = 0;

            if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {

                v1.set(-vFrom.y, vFrom.x, 0);

            } else {

                v1.set(0, -vFrom.z, vFrom.y);

            }

        } else {

            v1.copy(vFrom).cross(vTo);

        }

        this.x = v1.x;
        this.y = v1.y;
        this.z = v1.z;
        this.w = r;

        this.normalize();

        return this;

    }

    setFromRotationMatrix(m: Matrix4) {

        // http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm

        // assumes the upper 3x3 of m is a pure rotation matrix
        // (i.e, unscaled)

        let s: number;
        let te = m.elements,
            m11 = te[0], m12 = te[4], m13 = te[8], m21 = te[1], m22 = te[5], m23 = te[9], m31 = te[2], m32 = te[6], m33 = te[10],
            trace = m11 + m22 + m33;
        

        if (trace > 0) {

            s = 0.5 / Math.sqrt(trace + 1.0);

            this.w = 0.25 / s;
            this.x = (m32 - m23) * s;
            this.y = (m13 - m31) * s;
            this.z = (m21 - m12) * s;

        } else if (m11 > m22 && m11 > m33) {

            s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);

            this.w = (m32 - m23) / s;
            this.x = 0.25 * s;
            this.y = (m12 + m21) / s;
            this.z = (m13 + m31) / s;

        } else if (m22 > m33) {

            s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);

            this.w = (m13 - m31) / s;
            this.x = (m12 + m21) / s;
            this.y = 0.25 * s;
            this.z = (m23 + m32) / s;

        } else {

            s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);

            this.w = (m21 - m12) / s;
            this.x = (m13 + m31) / s;
            this.y = (m23 + m32) / s;
            this.z = 0.25 * s;

        }

        return this;

    }

    toEuler(out?: Euler) {

        out = out || new Euler();

        let ysqr = this.y * this.y;

        // roll (x-axis rotation)
        let t0 = 2.0 * (this.w * this.x + this.y * this.z);
        let t1 = 1.0 - 2.0 * (this.x * this.x + ysqr);
        out.roll = Math.atan2(t0, t1);

        // pitch (y-axis rotation)
        let t2 = 2.0 * (this.w * this.y - this.z * this.x);
        t2 = t2 > 1.0 ? 1.0 : t2;
        t2 = t2 < -1.0 ? -1.0 : t2;
        out.pitch = Math.asin(t2);

        // yaw (z-axis rotation)
        let t3 = 2.0 * (this.w * this.z + this.x * this.y);
        let t4 = 1.0 - 2.0 * (ysqr + this.z * this.z);
        out.yaw = Math.atan2(t3, t4);

        return out;

    }


    static Slerp(qa: Quaternion, qb: Quaternion, qm: Quaternion, lambda: number) {

        // Calculate angle between them.
        let cosHalfTheta = qa.w * qb.w + qa.x * qb.x + qa.y * qb.y + qa.z * qb.z;
        // if qa=qb or qa=-qb then theta = 0 and we can return qa
        if (Math.abs(cosHalfTheta) >= 1.0) {
            qm.w = qa.w; qm.x = qa.x; qm.y = qa.y; qm.z = qa.z;
            return qm;
        }
        // Calculate temporary values.
        let halfTheta = Math.acos(cosHalfTheta);
        let sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);
        // if theta = 180 degrees then result is not fully defined
        // we could rotate around any axis normal to qa or qb
        if (Math.abs(sinHalfTheta) < 0.001) { // fabs is floating point absolute
            qm.w = (qa.w * 0.5 + qb.w * 0.5);
            qm.x = (qa.x * 0.5 + qb.x * 0.5);
            qm.y = (qa.y * 0.5 + qb.y * 0.5);
            qm.z = (qa.z * 0.5 + qb.z * 0.5);
            return qm;
        }
        let ratioA = Math.sin((1 - lambda) * halfTheta) / sinHalfTheta;
        let ratioB = Math.sin(lambda * halfTheta) / sinHalfTheta;
        //calculate Quaternion.
        qm.w = (qa.w * ratioA + qb.w * ratioB);
        qm.x = (qa.x * ratioA + qb.x * ratioB);
        qm.y = (qa.y * ratioA + qb.y * ratioB);
        qm.z = (qa.z * ratioA + qb.z * ratioB);
        return qm;

    }

};


/**
 * Euler representation of a rotation
 */
export class Euler {

	public pitch: number = ZERO_F32;
	public roll: number = ZERO_F32;
	public yaw: number = ZERO_F32;

	/**
	 * Create a new euler object
	 * @param pitch
	 * @param roll
	 * @param yaw
	 */
	constructor(pitch?: any, roll?: number, yaw?: number) {


		var v = this;
		if (arguments.length == 3) {
			this.pitch = f32(pitch);
			this.roll = f32(roll);
			this.yaw = f32(yaw);

		} else if (Array.isArray(pitch)) {

			this.pitch = f32(pitch[0]) || ZERO_F32;
			this.roll = f32(pitch[1]) || ZERO_F32;
			this.yaw = f32(pitch[2]) || ZERO_F32;

		} else if (pitch instanceof Euler) {
			this.pitch = pitch.pitch;
			this.roll = pitch.roll;
			this.yaw = pitch.yaw;
		}

	}

	toQuaternion(out?: Quaternion) {

		out = out || new Quaternion();


		let t0 = Math.cos(this.yaw * 0.5);
		let t1 = Math.sin(this.yaw * 0.5);
		let t2 = Math.cos(this.roll * 0.5);
		let t3 = Math.sin(this.roll * 0.5);
		let t4 = Math.cos(this.pitch * 0.5);
		let t5 = Math.sin(this.pitch * 0.5);

		out.w = t0 * t2 * t4 + t1 * t3 * t5;
		out.x = t0 * t3 * t4 - t1 * t2 * t5;
		out.y = t0 * t2 * t5 + t1 * t3 * t4;
		out.z = t1 * t2 * t4 - t0 * t3 * t5;

		return out;

	}

	toAxisAngle(out?: Vector4) {

		out = out || new Vector4();


		let c1 = Math.cos(this.pitch / 2);
		let s1 = Math.sin(this.pitch / 2);
		let c2 = Math.cos(this.yaw / 2);
		let s2 = Math.sin(this.yaw / 2);
		let c3 = Math.cos(this.roll / 2);
		let s3 = Math.sin(this.roll / 2);
		let c1c2 = c1 * c2;
		let s1s2 = s1 * s2;
		let w = c1c2 * c3 - s1s2 * s3;
		let x = c1c2 * s3 + s1s2 * c3;
		let y = s1 * c2 * c3 + c1 * s2 * s3;
		let z = c1 * s2 * c3 - s1 * c2 * s3;
		let angle = 2 * Math.acos(w);
		let norm = x * x + y * y + z * z;
		if (norm < 0.001) { // when all euler angles are zero angle =0 so
			// we can set axis to anything to avoid divide by zero
			x = 1;
			y = z = 0;
		} else {
			norm = Math.sqrt(norm);
			x /= norm;
			y /= norm;
			z /= norm;
		}

		return out.set(x, y, z, w);
	}

}

