import { GizmoHelper, GizmoViewport, Grid, Line } from "@react-three/drei";
import { useMemo } from "react";
import { useRecoilValue } from "recoil";
import { DoubleSide, Vector3 } from "three";
import { isGridOnAtom } from "../state";
import { getGridQuaternionFromUpVector } from "../utils";
import { useFo3dContext } from "./context";

const AXIS_RED_COLOR = "#FF2160";
const AXIS_GREEN_COLOR = "#21DF80";
const AXIS_BLUE_COLOR = "#2280FF";

const GRID_CELL_COLOR = "#6f6f6f";
const GRID_SECTION_COLOR = "#a79d9d";

const FoAxesHelper = ({
  maxInOrthonormalPlane,
}: {
  maxInOrthonormalPlane: number;
}) => {
  const { upVector } = useFo3dContext();
  const size = useMemo(
    () => maxInOrthonormalPlane * 20,
    [maxInOrthonormalPlane]
  );

  const axes = useMemo(
    () => [
      {
        start: new Vector3(-size / 2, 0, 0),
        end: new Vector3(size / 2, 0, 0),
        color: AXIS_RED_COLOR,
      },
      {
        start: new Vector3(0, -size / 2, 0),
        end: new Vector3(0, size / 2, 0),
        color: AXIS_GREEN_COLOR,
      },
      {
        start: new Vector3(0, 0, -size / 2),
        end: new Vector3(0, 0, size / 2),
        color: AXIS_BLUE_COLOR,
      },
    ],
    [size]
  );

  const axisComponents = useMemo(() => {
    return axes
      .filter(
        (axis) =>
          !(
            (axis.color === AXIS_RED_COLOR && upVector.x === 1) ||
            (axis.color === AXIS_GREEN_COLOR && upVector.y === 1) ||
            (axis.color === AXIS_BLUE_COLOR && upVector.z === 1)
          )
      )
      .map((axis) => {
        return (
          <Line
            key={axis.color}
            points={[axis.start, axis.end]}
            color={axis.color}
            lineWidth={1.1}
            opacity={0.3}
            transparent
          />
        );
      });
  }, [upVector, axes]);

  return <>{axisComponents}</>;
};

export const Gizmos = () => {
  const { upVector, sceneBoundingBox } = useFo3dContext();
  const isGridOn = useRecoilValue(isGridOnAtom);

  const gridHelperQuarternion = useMemo(
    () => getGridQuaternionFromUpVector(upVector),
    [upVector]
  );

  const maxInOrthonormalPlane = useMemo(() => {
    if (!sceneBoundingBox) {
      return 0;
    }

    const sceneSize = sceneBoundingBox.getSize(new Vector3());

    if (upVector.x === 1) {
      return Math.max(sceneSize.y, sceneSize.z);
    }

    if (upVector.y === 1) {
      return Math.max(sceneSize.x, sceneSize.z);
    }

    return Math.max(sceneSize.x, sceneSize.y);
  }, [sceneBoundingBox, upVector]);

  // cell size is based on max bounding box size
  // following multipliers (0.5, 10, 30) are arbitrary and can be adjusted
  const cellSize = useMemo(
    () => maxInOrthonormalPlane * 0.5,
    [maxInOrthonormalPlane]
  );
  const sectionSize = useMemo(() => cellSize * 10, [cellSize]);

  const fadeDistance = useMemo(
    () => maxInOrthonormalPlane * 30,
    [maxInOrthonormalPlane]
  );

  return (
    <>
      {isGridOn && (
        <>
          <Grid
            quaternion={gridHelperQuarternion}
            infiniteGrid
            side={DoubleSide}
            cellSize={cellSize}
            sectionSize={sectionSize}
            sectionColor={GRID_SECTION_COLOR}
            cellColor={GRID_CELL_COLOR}
            fadeDistance={fadeDistance}
            fadeStrength={1}
            followCamera
            cellThickness={0.5}
            sectionThickness={0.8}
          />
          <FoAxesHelper maxInOrthonormalPlane={maxInOrthonormalPlane} />
        </>
      )}
      <GizmoHelper alignment="top-left" margin={[80, 100]}>
        <GizmoViewport />
      </GizmoHelper>
    </>
  );
};
