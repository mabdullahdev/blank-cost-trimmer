import * as d3 from 'd3';

// convert the array that contains polygon points into string format that can be used by SVG polygon 
export const PointsArray_to_PointsString = function(points){
	var i
	var PointsString ="";
	for (i=0; i<points.length; i++){
		if (i!==0){
			PointsString += " ";
		}
		PointsString += points[i][0];
		PointsString += ",";
		PointsString += points[i][1];
	}
	return PointsString;
}

// sort the polygong points into counterclockwiae order
export const Sort_points_CounterClockwise = function(points_group){
	var i;
	var j;
	var point_temp = [];
	var angle_temp;
	var angle_min;
	var angle_min_index;
	var centroid_point = [];
	centroid_point = Find_centroid(points_group);
	// bubble sorting algorithm to sort all points from the minimum angle to maximum angle, counter clock wise direction
	for (i=0; i<points_group.length-1; i++){
		angle_min_index = i;
		angle_min = calcAngleDegrees(points_group[i][0]-centroid_point[0], points_group[i][1]-centroid_point[1]);
		for (j=i; j<points_group.length; j++){
			angle_temp = calcAngleDegrees(points_group[j][0]-centroid_point[0], points_group[j][1]-centroid_point[1]);
			if (angle_temp < angle_min){
				angle_min = angle_temp;
				angle_min_index = j;
			}
		}
		point_temp = [points_group[i][0],points_group[i][1]];
		points_group[i][0] = points_group[angle_min_index][0];
		points_group[i][1] = points_group[angle_min_index][1];
		points_group[angle_min_index][0] = point_temp[0];
		points_group[angle_min_index][1] = point_temp[1];
	}
}

// find the best fit rectangular shape, return the four nodes array of the rec in counter clock wise sequence
export const Best_fit_Rec = function(Hull_Poly) {
	var i;
	var j =0;;
	var k;
	var points_group = [[]]; 
	var points_line = [[]]; 
	var point_max_dis; 
	var Rec_lines_formula = []; 
	var Rec_corners = []; 
	var Rec_area = 0; 
	var Rec_area_min = 0;
	var Rec_corners_min = []; 
	
	// first initialize the 2 dimensional array that used to store nodes of rectangular.  
	for (k=0; k<4; k++){
			Rec_corners_min[k]=[];
		}
	for (i=0; i<Hull_Poly.length; i++){
		// if the last point reached, use the last point and first point to make the line
		if (i === Hull_Poly.length-1){
			points_line[0] = [Hull_Poly[i][0],Hull_Poly[i][1]];
			points_line[1] = [Hull_Poly[0][0],Hull_Poly[0][1]];
			for (j=1; j<i; j++){
				points_group[j-1] = [Hull_Poly[j][0],Hull_Poly[j][1]];
			}
		} else {
			points_line[0] = [Hull_Poly[i][0],Hull_Poly[i][1]];
			points_line[1] = [Hull_Poly[i+1][0],Hull_Poly[i+1][1]];
			for (j=0; j<i; j++){
				points_group[j] = [Hull_Poly[j][0],Hull_Poly[j][1]];
			}
			for (k=j+2; k<Hull_Poly.length; k++){
				points_group[k-2] = [Hull_Poly[k][0],Hull_Poly[k][1]];
			}
		}
		Rec_lines_formula[0] = Parallel_line_formula (points_line, points_line[0]);
		point_max_dis = Find_the_farest_points (points_line, points_group)
		Rec_lines_formula[2] = Parallel_line_formula (points_line, point_max_dis);
		point_max_dis = Find_the_farest_points_line_formula (Perpendicular_line_formula (points_line, point_max_dis), Hull_Poly)
		Rec_lines_formula[1] = Perpendicular_line_formula (points_line, point_max_dis)

		point_max_dis = Find_the_farest_points_line_formula (Perpendicular_line_formula (points_line, point_max_dis), Hull_Poly)
		
		Rec_lines_formula[3] = Perpendicular_line_formula (points_line, point_max_dis)

		// calculate four corners of the rectangular from the four lines calculated above
		Rec_corners[0] = Find_intersection(Rec_lines_formula[3], Rec_lines_formula[0]);
		Rec_corners[1] = Find_intersection(Rec_lines_formula[0], Rec_lines_formula[1]);
		Rec_corners[2] = Find_intersection(Rec_lines_formula[1], Rec_lines_formula[2]);
		Rec_corners[3] = Find_intersection(Rec_lines_formula[2], Rec_lines_formula[3]);

		// calculate the area of this rectangular 
		Rec_area = d3.polygonArea(Rec_corners)

		if (i === 0){
			Rec_area_min = Math.abs(Rec_area);
			for (k=0; k<4; k++){
				Rec_corners_min[k][0] = Rec_corners[k][0];
				Rec_corners_min[k][1] = Rec_corners[k][1];
			}
		}
		
		// find the rectangular with minimum area
		if (Math.abs(Rec_area) < Rec_area_min){
			Rec_area_min = Math.abs(Rec_area);
			for (k=0; k<4; k++){
				Rec_corners_min[k][0] = Rec_corners[k][0];
				Rec_corners_min[k][1] = Rec_corners[k][1];
			}
		}
	}
	Sort_points_CounterClockwise(Rec_corners_min)
	Rec_corners_min.reverse();
	return Rec_corners_min	
}

export const Best_fit_Trapezoid = function(Rec_corners, Hull_Poly){
	var Trapezoid_1 = [];
	var Trapezoid_2 = [];
	var Rec_corners_temp = [];

	Rec_corners_temp[0] = [Rec_corners[1][0], Rec_corners[1][1]];
	Rec_corners_temp[1] = [Rec_corners[2][0], Rec_corners[2][1]];
	Rec_corners_temp[2] = [Rec_corners[3][0], Rec_corners[3][1]];
	Rec_corners_temp[3] = [Rec_corners[0][0], Rec_corners[0][1]];
	Trapezoid_1 = Trapezoid_fit(Rec_corners, Hull_Poly);
	
	Trapezoid_2 = Trapezoid_fit(Rec_corners_temp, Hull_Poly);
	
	if (d3.polygonArea(Trapezoid_1) < d3.polygonArea(Trapezoid_2)){
		return Trapezoid_1;
	} else {
		return Trapezoid_2;
	}
}

// distance between two points
export const Distance_between_points = function(PointA, PointB){
	return Math.sqrt(Math.pow((PointA[0]-PointB[0]),2) + Math.pow((PointA[1]-PointB[1]),2));
}

// find the point with maximum distance from the line
export const Find_the_farest_points = function(points_line, points_group){
	var i;
	var dis;
	var max_dis =0 ;
	var max_dis_index = 0;
	for (i=0; i<points_group.length; i++) {
		dis = Math.abs((points_line[0][1]-points_line[1][1])*points_group[i][0]+(points_line[1][0]-points_line[0][0])*points_group[i][1]+((points_line[0][0]-points_line[1][0])*points_line[0][1]-(points_line[0][1]-points_line[1][1])*points_line[0][0]))/Math.sqrt(Math.pow((points_line[0][1]-points_line[1][1]),2)+Math.pow((points_line[1][0]-points_line[0][0]),2));
		if (dis > max_dis) {
			max_dis = dis;
			max_dis_index = i;
		}
	}
	return (points_group[max_dis_index])
}

// find the point that has the maximum distance to the line from points_group
export const Find_the_farest_points_line_formula = function(line_formula, points_group){
	var i;
	var dis;
	var max_dis =0 ;
	var max_dis_index = 0;
	for (i=0; i<points_group.length; i++) {
		dis = Math.abs(line_formula[0]*points_group[i][0]+line_formula[1]*points_group[i][1]+line_formula[2])/Math.sqrt(Math.pow(line_formula[0],2)+Math.pow(line_formula[1],2));
		if (dis > max_dis) {
			max_dis = dis;
			max_dis_index = i;
		}
	}
	return (points_group[max_dis_index])
}

// the formula of the perpendicular line: Ax+By+C=0
export const Perpendicular_line_formula = function(points_line, passing_point){
	var line_formula = [];
	line_formula[0] = points_line[1][0] - points_line[0][0];
	line_formula[1] = points_line[1][1] - points_line[0][1];
	line_formula[2] = -line_formula[0]*passing_point[0] - line_formula[1]*passing_point[1];
	//console.log("line_formula = ", line_formula);
	return line_formula;
}

// the formula of the parallel line: Ax+By+C=0
export const Parallel_line_formula = function(points_line, passing_point){
	var line_formula = [];
	line_formula[0] = points_line[1][1] - points_line[0][1];
	line_formula[1] = points_line[0][0] - points_line[1][0];
	line_formula[2] = -line_formula[0]*passing_point[0] - line_formula[1]*passing_point[1];
	//console.log("line_formula = ", line_formula);
	return line_formula;
}

// find the intersection of two lines
export const Find_intersection = function(line_formulaA,line_formulaB){
	var a1 = line_formulaA[0];
	var b1 = line_formulaA[1];
	var c1 = line_formulaA[2];
	var a2 = line_formulaB[0];
	var b2 = line_formulaB[1];
	var c2 = line_formulaB[2];
	return [(b1*c2-b2*c1)/(a1*b2-a2*b1),(a2*c1-a1*c2)/(a1*b2-a2*b1)];
}

export const Find_constrain_points_multi_poly = function(points_poly, constrain_polys){
	var i;
	var j = 0;
	var k;
	var temp_value = 0;
	var constrained_points = [];
	var constrained_status =[];
	var constrained_status_summary = [];
	var index_trace = [];
	for (k = 0; k<constrain_polys.length; k++){
		constrained_status[k]=[];
	}
	for (k = 0; k<constrain_polys.length; k++){
		for (i=0; i<points_poly.length; i++){
			if (d3.polygonContains(constrain_polys[k], points_poly[i])){
				constrained_status[k][i] = 1;
			} else {
				constrained_status[k][i] = 0;
			}
		}
	}
	for (i=0; i<points_poly.length; i++){
		for (k = 0; k<constrain_polys.length; k++){
			temp_value = temp_value + constrained_status[k][i];
		}
		if (temp_value > 0){
			constrained_status_summary[i]=1;
		} else{
			constrained_status_summary[i]=0;
		}
		temp_value = 0;
	}
	for (i=0; i<points_poly.length; i++){
		if (constrained_status_summary[i] > 0){
			constrained_points[j] = [points_poly[i][0], points_poly[i][1]];
			index_trace[j] = i;
			j = j+1;
		}
	}
	return [constrained_points, constrained_status_summary];
}


// calculate the angle between (0 ,0) to (x, y)
export const calcAngleDegrees = function(x, y) {
	return Math.atan2(y, x)*180 / Math.PI;
}

// find the centroid of points
export const Find_centroid = function(points_group){
	var i;
	var N = points_group.length;
	var x = 0;
	var y = 0;
	for (i=0; i<N; i++){
		x = x + points_group[i][0]; 
		y = y + points_group[i][1]; 
	}
	x = x / N;
	y = y / N;
	return [x, y]
}

// function to create the two parallel lines of an edge with distance of d_distance: two lines on both sides of the edge 
export const Parallel_lines_with_distance = function(points_line, d_distance){
	var x1;
	var y1;
	var x2;
	var y2;
	var a1;
	var b1;
	var c1;
	var a2;
	var b2;
	var c2; 
	[a1, b1, c1] = Parallel_line_formula (points_line, points_line[0]);
	[a2, b2, c2] = Perpendicular_line_formula (points_line, points_line[0]);
	
	// calculate the points away from the line with distance d_distance
	y1 = (a1*c2 - c1*a2 + a2*d_distance*Math.sqrt(a1*a1+b1*b1))/(b1*a2-a1*b2);
	x1 = -b2/a2*y1 - c2/a2;
	
	y2 = (a1*c2 - c1*a2 - a2*d_distance*Math.sqrt(a1*a1+b1*b1))/(b1*a2-a1*b2);
	x2 = -b2/a2*y2 - c2/a2;
	
	// calculate the line formula that parallel with line points_line and passing the points just calculated above
	[a1, b1, c1] = Parallel_line_formula (points_line, [x1, y1]);
	[a2, b2, c2] = Parallel_line_formula (points_line, [x2, y2]);
	
	// return line formulas
	return [[a1, b1, c1], [a2, b2, c2]];
}

// find the bounding limit of the trapezoid, this is used for creaing the cutting polygon
export const Bounding_limit = function(Trapezoid_points){
	var i;
	var offset_value = 100;
	var x_min = Trapezoid_points[0][0];
	var x_max = Trapezoid_points[0][0];
	var y_min = Trapezoid_points[0][1];
	var y_max = Trapezoid_points[0][1];
	for (i=0; i<Trapezoid_points.length; i++){
		if (Trapezoid_points[i][0] < x_min){
			x_min = Trapezoid_points[i][0];
		}
		if (Trapezoid_points[i][0] > x_max){
			x_max = Trapezoid_points[i][0];
		}
		if (Trapezoid_points[i][1] < y_min){
			y_min = Trapezoid_points[i][1];
		}
		if (Trapezoid_points[i][1] > y_max){
			y_max = Trapezoid_points[i][1];
		}
	}
	return [x_min - offset_value, x_max + offset_value, y_min - offset_value, y_max + offset_value];
}

// creat the cutting polygon 
export const Cutting_polygon = function(parallel_formulas, bounding_edges){
	var point_intersection = [];
	var line_x_min = [1, 0, -bounding_edges[0]];
	var line_x_max = [1, 0, -bounding_edges[1]];
	var line_y_min = [0, 1, -bounding_edges[2]];
	var line_y_max = [0, 1, -bounding_edges[3]];
	
	// find all four points of the intersection between bounding edges and parallel lines
	if (parallel_formulas[0][0] !== 0){
		point_intersection[0] = Find_intersection (parallel_formulas[0],line_y_min);
		point_intersection[1] = Find_intersection (parallel_formulas[0],line_y_max);
		point_intersection[2] = Find_intersection (parallel_formulas[1],line_y_min);
		point_intersection[3] = Find_intersection (parallel_formulas[1],line_y_max);
	} else {
		point_intersection[0] = Find_intersection (parallel_formulas[0],line_x_min);
		point_intersection[1] = Find_intersection (parallel_formulas[0],line_x_max);
		point_intersection[2] = Find_intersection (parallel_formulas[1],line_x_min);
		point_intersection[3] = Find_intersection (parallel_formulas[1],line_x_max);
	}
	
	// sort all intersection points in counter clocl wise sequence
	Sort_points_CounterClockwise(point_intersection)
	return point_intersection;		
}

// trim the polygon 
export const Trim_polygon = function(points, Best_fit_Trapezoid, points_line, d_distance, constrain_status){
	var i;
	var points_after_trim = [];
	var constrain_status_after_trim = [];
	var trim_line = Parallel_lines_with_distance(points_line, d_distance);
	var edge_limites = Bounding_limit (Best_fit_Trapezoid);
	var trim_poly = Cutting_polygon (trim_line, edge_limites);
	
	for (i=0; i<points.length; i++){
		if (d3.polygonContains(trim_poly, points[i])){
			if (constrain_status[i]) {
				points_after_trim.push([points[i][0], points[i][1]]);
				constrain_status_after_trim.push(constrain_status[i]);
			}
		}else {
			points_after_trim.push([points[i][0], points[i][1]]);
			constrain_status_after_trim.push(constrain_status[i]);
		}
	}
	return [points_after_trim, constrain_status_after_trim];
}

// calculate two points on the line with equal distance away from PointB
// return the point that have the longer distance  
export const Point_on_line_with_shift = function(PointA, PointB){
	var shift_factor = 100;
	var line_formula = [];
	var x1;
	var y1;
	var x2;
	var y2;
	var dis1;
	var dis2;
	line_formula = Parallel_line_formula ([PointA, PointB], PointB);
	// console.log("line_formula  = ", line_formula)
	if (line_formula[1] !== 0){
		x1 = PointB[0]+shift_factor;
		x2 = PointB[0]-shift_factor;
		y1 = (-line_formula[2]-line_formula[0]*x1)/line_formula[1];
		y2 = (-line_formula[2]-line_formula[0]*x2)/line_formula[1];
	} else {
		y1 = PointB[1]+shift_factor;
		y2 = PointB[1]-shift_factor;
		x1 = (-line_formula[2]-line_formula[1]*y1)/line_formula[0];
		x2 = (-line_formula[2]-line_formula[1]*y2)/line_formula[0];
	}

	dis1 = Distance_between_points(PointA, [x1, y1]);
	dis2 = Distance_between_points(PointA, [x2, y2]);

	if (dis1 > dis2) {
		return [x1, y1];
	} else {
		return [x2, y2];
	}
}

// find the best fit trapezoid shape based on one edge of the best fit rec, return the four nodes array of the rec
export const Trapezoid_fit = function(Rec_corners, Hull_Poly) {
	var i;
	var j;
	var k;
	var x1;
	var y1;
	var x2;
	var y2;
	var poly1=[];
	var Hull_Poly1 = [];
	var Hull_Poly2 = [];
	var Hull_Poly1_index_trace = [];
	var Hull_Poly2_index_trace = [];
	var temp_array0 = [];
	var temp_array1 = [];
	var Trapezoid_Poly = [];
	
	
	x1 = (Rec_corners[0][0] + Rec_corners[3][0])/2;
	y1 = (Rec_corners[0][1] + Rec_corners[3][1])/2;
	x2 = (Rec_corners[1][0] + Rec_corners[2][0])/2;
	y2 = (Rec_corners[1][1] + Rec_corners[2][1])/2;
	poly1[0] = [Rec_corners[0][0],Rec_corners[0][1]];
	poly1[1] = [Rec_corners[1][0],Rec_corners[1][1]];
	poly1[2] = [x2, y2];
	poly1[3] = [x1, y1];
	


	temp_array0 = Point_on_line_with_shift(poly1[2], poly1[0]);
	temp_array1 = Point_on_line_with_shift(poly1[3], poly1[1]);

	poly1[0][0] = temp_array0[0];
	poly1[0][1] = temp_array0[1];
	
	poly1[1][0] = temp_array1[0];
	poly1[1][1] = temp_array1[1];
	

	
	j=0;
	k=0;
	for (i=0; i<Hull_Poly.length; i++){
		// if point is outside poly1, store it in Hull_Poly1
		if (d3.polygonContains(poly1, Hull_Poly[i])){
			Hull_Poly2[j] = [Hull_Poly[i][0], Hull_Poly[i][1]];
			Hull_Poly2_index_trace[j] = i;
			j = j+1;
		} else {
			Hull_Poly1[k] = [Hull_Poly[i][0], Hull_Poly[i][1]];
			Hull_Poly1_index_trace[k] = i;
			k = k+1;
		}
	}
	

	//console.log("Hull_Poly.length  = ", Hull_Poly)
	// calculate the line parallel to the two edges of trapezoid and crossing from the middle
	x1 = (Rec_corners[0][0] + Rec_corners[3][0])/2;
	y1 = (Rec_corners[0][1] + Rec_corners[3][1])/2;
	x2 = (Rec_corners[1][0] + Rec_corners[2][0])/2;
	y2 = (Rec_corners[1][1] + Rec_corners[2][1])/2;
	

	j = Hull_Poly2_index_trace[0]; 
	var current_point_status = true; 
	var next_point_status;
	var crossing_point_pair1_1;
	var crossing_point_pair1_2;
	var crossing_point_pair2_1;
	var crossing_point_pair2_2;
	var crossing_point_pair_temp;
	var crossing_counts = 1;
	var line_formula_boundary = [];
	var intersection_A;
	var intersection_B;
	var intersection_C;
	var intersection_D;
	var area_A;
	var area_B;
	
	for (i = 0; i < Hull_Poly.length; i++){
		 j = j+1;
		 if (j === Hull_Poly.length){
			 j = 0;
		 }
		 next_point_status = d3.polygonContains(poly1, Hull_Poly[j]); // true if point contains inside Hull_Poly2
		 if (next_point_status !== current_point_status){ 
			 if (crossing_counts === 1){
				 current_point_status = next_point_status;
				 crossing_counts = crossing_counts +1;
				 if (j === 0){
					 crossing_point_pair1_1 = Hull_Poly.length - 1;
				 } else {
					 crossing_point_pair1_1 = j - 1;
				 }
				 crossing_point_pair1_2 = j;
			 } else {
				 current_point_status = next_point_status;
				 if (j === 0){
					 crossing_point_pair2_1 = Hull_Poly.length - 1;
				 } else {
					 crossing_point_pair2_1 = j - 1;
				 }
				 crossing_point_pair2_2 = j;
			 }
			
		 }
	}

	line_formula_boundary = Parallel_line_formula ([[x1, y1],[x2, y2]], [x1, y1]);
	if ((line_formula_boundary[0]*Hull_Poly[crossing_point_pair1_2][0]+line_formula_boundary[1]*Hull_Poly[crossing_point_pair1_2][1]+line_formula_boundary[2])!==0){
		intersection_A = Find_intersection (Parallel_line_formula ([Hull_Poly[crossing_point_pair1_1], Hull_Poly[crossing_point_pair1_2]], Hull_Poly[crossing_point_pair1_2]),Parallel_line_formula ([Rec_corners[1],Rec_corners[0]], Rec_corners[1]));
		intersection_B = Find_intersection (Parallel_line_formula ([Hull_Poly[crossing_point_pair1_1], Hull_Poly[crossing_point_pair1_2]], Hull_Poly[crossing_point_pair1_2]),Parallel_line_formula ([Rec_corners[2],Rec_corners[3]], Rec_corners[2]));

		Trapezoid_Poly[0] = [intersection_A[0], intersection_A[1]];
		Trapezoid_Poly[1] = [intersection_B[0], intersection_B[1]];

	} else { // check with the point before and after the point
		intersection_A = Find_intersection (Parallel_line_formula ([Hull_Poly[crossing_point_pair1_1], Hull_Poly[crossing_point_pair1_2]], Hull_Poly[crossing_point_pair1_2]),Parallel_line_formula ([Rec_corners[1],Rec_corners[0]], Rec_corners[1]));
		intersection_B = Find_intersection (Parallel_line_formula ([Hull_Poly[crossing_point_pair1_1], Hull_Poly[crossing_point_pair1_2]], Hull_Poly[crossing_point_pair1_2]),Parallel_line_formula ([Rec_corners[2],Rec_corners[3]], Rec_corners[2]));
		
		crossing_point_pair_temp = crossing_point_pair1_2 + 1;
		if (crossing_point_pair_temp === Hull_Poly.length){
			crossing_point_pair_temp = 0;
		}
		
		intersection_C = Find_intersection (Parallel_line_formula ([Hull_Poly[crossing_point_pair_temp], Hull_Poly[crossing_point_pair1_2]], Hull_Poly[crossing_point_pair1_2]),Parallel_line_formula ([Rec_corners[1],Rec_corners[0]], Rec_corners[1]));
		intersection_D = Find_intersection (Parallel_line_formula ([Hull_Poly[crossing_point_pair_temp], Hull_Poly[crossing_point_pair1_2]], Hull_Poly[crossing_point_pair1_2]),Parallel_line_formula ([Rec_corners[2],Rec_corners[3]], Rec_corners[2]));
		
		area_A = Math.abs(d3.polygonArea([intersection_A, intersection_B, Rec_corners[3], Rec_corners[0]]));
		area_B = Math.abs(d3.polygonArea([intersection_C, intersection_D, Rec_corners[3], Rec_corners[0]]));
		
		if (area_A < area_B){
			Trapezoid_Poly[0] = [intersection_A[0], intersection_A[1]];
			Trapezoid_Poly[1] = [intersection_B[0], intersection_B[1]];
		} else {
			Trapezoid_Poly[0] = [intersection_C[0], intersection_C[1]];
			Trapezoid_Poly[1] = [intersection_D[0], intersection_D[1]];
		}

	}
	
	// second check crossing_point_pair2_2 is on the boundary or not
		if ((line_formula_boundary[0]*Hull_Poly[crossing_point_pair2_2][0]+line_formula_boundary[1]*Hull_Poly[crossing_point_pair2_2][1]+line_formula_boundary[2])!==0){

		intersection_A = Find_intersection (Parallel_line_formula ([Hull_Poly[crossing_point_pair2_1], Hull_Poly[crossing_point_pair2_2]], Hull_Poly[crossing_point_pair2_2]),Parallel_line_formula ([Rec_corners[1],Rec_corners[0]], Rec_corners[1]));
		intersection_B = Find_intersection (Parallel_line_formula ([Hull_Poly[crossing_point_pair2_1], Hull_Poly[crossing_point_pair2_2]], Hull_Poly[crossing_point_pair2_2]),Parallel_line_formula ([Rec_corners[2],Rec_corners[3]], Rec_corners[2]));

		Trapezoid_Poly[2] = [intersection_A[0], intersection_A[1]];
		Trapezoid_Poly[3] = [intersection_B[0], intersection_B[1]];

	} else { 
		intersection_A = Find_intersection (Parallel_line_formula ([Hull_Poly[crossing_point_pair2_1], Hull_Poly[crossing_point_pair2_2]], Hull_Poly[crossing_point_pair2_2]),Parallel_line_formula ([Rec_corners[1],Rec_corners[0]], Rec_corners[1]));
		intersection_B = Find_intersection (Parallel_line_formula ([Hull_Poly[crossing_point_pair2_1], Hull_Poly[crossing_point_pair2_2]], Hull_Poly[crossing_point_pair2_2]),Parallel_line_formula ([Rec_corners[2],Rec_corners[3]], Rec_corners[2]));
		
		crossing_point_pair_temp = crossing_point_pair2_2 + 1;
		if (crossing_point_pair_temp === Hull_Poly.length){
			crossing_point_pair_temp = 0;
		}
		
		intersection_C = Find_intersection (Parallel_line_formula ([Hull_Poly[crossing_point_pair_temp], Hull_Poly[crossing_point_pair2_2]], Hull_Poly[crossing_point_pair2_2]),Parallel_line_formula ([Rec_corners[1],Rec_corners[0]], Rec_corners[1]));
		intersection_D = Find_intersection (Parallel_line_formula ([Hull_Poly[crossing_point_pair_temp], Hull_Poly[crossing_point_pair2_2]], Hull_Poly[crossing_point_pair2_2]),Parallel_line_formula ([Rec_corners[2],Rec_corners[3]], Rec_corners[2]));
		
		area_A = Math.abs(d3.polygonArea([intersection_B, intersection_A, Rec_corners[1], Rec_corners[2]]));
		area_B = Math.abs(d3.polygonArea([intersection_D, intersection_C, Rec_corners[1], Rec_corners[2]]));
		
		if (area_A < area_B){
			Trapezoid_Poly[2] = [intersection_A[0], intersection_A[1]];
			Trapezoid_Poly[3] = [intersection_B[0], intersection_B[1]];
		} else {
			Trapezoid_Poly[2] = [intersection_C[0], intersection_C[1]];
			Trapezoid_Poly[3] = [intersection_D[0], intersection_D[1]];
		}

	}
	
	Sort_points_CounterClockwise(Trapezoid_Poly)
	Trapezoid_Poly.reverse();

	
	return Trapezoid_Poly;
}

// remesh the polygon only at edges need to be remeshed 
export const polygon_edges_interpolation = function(points, spacing, constrain_status){
	var i;
	var points_interpolation = []; 
	var constrain_status_interpolation = [];
	var k;
	var x;
	var y;
	var distance_AB;
	var number_interpolation;
	var line_formula = [];
	for (i=0; i<points.length-1; i++){
		points_interpolation.push([points[i][0], points[i][1]]);
		constrain_status_interpolation.push(constrain_status[i]);
		distance_AB = Distance_between_points (points[i], points[i+1]);
		if (distance_AB > spacing){
			number_interpolation = Math.ceil(distance_AB/spacing);
			line_formula = Parallel_line_formula ([points[i], points[i+1]], points[i]);
			if (line_formula[1] === 0){
				for (k = 1; k < number_interpolation; k++){
					y = points[i][1] + (points[i+1][1]-points[i][1])/number_interpolation*k;
					x = (-line_formula[1]*y -line_formula[2])/line_formula[0];
					points_interpolation.push([x, y]);
					constrain_status_interpolation.push(0);
				}
			} else {
				for (k = 1; k < number_interpolation; k++){
					x = points[i][0] + (points[i+1][0]-points[i][0])/number_interpolation*k;
					y = (-line_formula[0]*x -line_formula[2])/line_formula[1];
					points_interpolation.push([x, y]);
					constrain_status_interpolation.push(0);
				}
			}
		}
	}
    
	// calculate the last edge
	points_interpolation.push([points[points.length-1][0], points[points.length-1][1]]);
	distance_AB = Distance_between_points (points[points.length-1], points[0]);
	constrain_status_interpolation.push(constrain_status[points.length-1]);
	if (distance_AB > spacing){
		number_interpolation = Math.ceil(distance_AB/spacing);
		line_formula = Parallel_line_formula ([points[points.length-1], points[0]], points[points.length-1]);
		if (line_formula[1] === 0){
			for (k = 1; k < number_interpolation; k++){
				y = points[points.length-1][1] + (points[0][1]-points[points.length-1][1])/number_interpolation*k;
				x = (-line_formula[1]*y -line_formula[2])/line_formula[0];
				points_interpolation.push([x, y]);
				constrain_status_interpolation.push(0);
			}
		} else {
			for (k = 1; k < number_interpolation; k++){
				x = points[points.length-1][0] + (points[0][0]-points[points.length-1][0])/number_interpolation*k;
				y = (-line_formula[0]*x -line_formula[2])/line_formula[1];
				points_interpolation.push([x, y]);
				constrain_status_interpolation.push(0);
			}
		}
	}

	return [points_interpolation, constrain_status_interpolation];
}