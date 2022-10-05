import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import HtmlToReact from 'html-to-react'

import * as d3 from 'd3'
import $ from 'jquery'

// MUI Components
import { 
    IconButton,
    Grid, 
    Card, 
    CardContent,
    CardActions,
    Tooltip
} from '@mui/material'

// MUI Icons
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest'
import CleaningServicesIcon from '@mui/icons-material/CleaningServices'
import EditIcon from '@mui/icons-material/Edit'
import DoneIcon from '@mui/icons-material/Done'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import ZoomOutIcon from '@mui/icons-material/ZoomOut'

// Styles
import {  makeStyles } from '@mui/styles'
import './Canvas'

import {
    PointsArray_to_PointsString,
    Find_constrain_points_multi_poly,
    polygon_edges_interpolation,
    Best_fit_Rec,
    Best_fit_Trapezoid,
    Trim_polygon
} from "../../global"

const HtmlToReactParser = new HtmlToReact.Parser()
const processNodeDefinitions = new HtmlToReact.ProcessNodeDefinitions(React)

const CASE_50 = '-50';
const CASE_50_500 = '50-500';
const CASE_500_2000 = '500-2000';
const CASE_2000 = '2000-';

let svgTagAttr = {}
let svgUpload = null
let svgDraw = null
let svgOptimize = null
let stageWrapContent = null
let dragImg = null
let svgRectViewInitial = null
let svgRectViewDragStart = null
let dragStartPoint = null
let pathTry = null
let svgDomRect = null

const isValidNode = () => {return true}

function optimizeSVG({ optimizeParam, constraints, visible, clear, showOptimizedBlank, uploadCanvas, canvasId}) {
    if(clear) {
        return (
            <></>
        )
    }

    // if(pathTry == null) {
    //     return;
    // }

    if(!visible) {
        return;
    }

    d3.select(uploadCanvas)

    let Mat_Uti_Improvement = optimizeParam.percentage / 100;
    let Mat_Uti_Points = optimizeParam.points;
    let Mat_Uti_Steps = optimizeParam.steps;
    
    let conditionCase = '';
    if ( $('#svg' + canvasId).attr('viewBox').split(' ')[2] < 50 || $('#svg' + canvasId).attr('viewBox').split(' ')[3] < 50 )
    {
        conditionCase = CASE_50;
    }
    else if ( ($('#svg' + canvasId).attr('viewBox').split(' ')[2] >= 50 && $('#svg' + canvasId).attr('viewBox').split(' ')[2] < 500) || ($('#svg' + canvasId).attr('viewBox').split(' ')[3] >= 50 && $('#svg' + canvasId).attr('viewBox').split(' ')[3] < 500) )
    {
        conditionCase = CASE_50_500;
    }
    else if ( ($('#svg' + canvasId).attr('viewBox').split(' ')[2] >= 500 && $('#svg' + canvasId).attr('viewBox').split(' ')[2] < 2000) || ($('#svg' + canvasId).attr('viewBox').split(' ')[3] >= 500 && $('#svg' + canvasId).attr('viewBox').split(' ')[3] < 2000) )
    {
        conditionCase = CASE_500_2000;
    }
    else if ( $('#svg' + canvasId).attr('viewBox').split(' ')[2] >= 2000 || $('#svg' + canvasId).attr('viewBox').split(' ')[3] >= 2000 )
    {
        conditionCase = CASE_2000;
    }
    
    let NUM_POINTS = Mat_Uti_Points;
    let pathTry = document.getElementById('pathTry' + canvasId)
    let len = pathTry.getTotalLength();
    let mesh_size = len / NUM_POINTS;
    console.log('mesh_size', mesh_size);

    var pt;
    var points = [];
    var pathTryCircles = [];
    for (var i=0; i < NUM_POINTS; i++) {
        pt = pathTry.getPointAtLength(i * len / NUM_POINTS);
        points.push([pt.x, pt.y]);
        
        if ( conditionCase === CASE_50 )
        {
            pathTryCircles.push({
                'r' : '0.1',
                'fill': 'yellow',
                'cx': pt.x,
                'cy': pt.y
            })
        }
        else if ( conditionCase === CASE_50_500 )
        {
            pathTryCircles.push({
                'r' : '1',
                'fill': 'yellow',
                'cx': pt.x,
                'cy': pt.y
            })
        }
        else if ( conditionCase === CASE_500_2000 )
        {
            pathTryCircles.push({
                'r' : '4',
                'fill': 'yellow',
                'cx': pt.x,
                'cy': pt.y
            })
        }
        else if ( conditionCase === CASE_2000 )
        {
            pathTryCircles.push({
                'r' : '8',
                'fill': 'yellow',
                'cx': pt.x,
                'cy': pt.y
            })
        }
    }

    // plot all mesh points
    var pp_mesh = PointsArray_to_PointsString(points);
    var pathTryPolygons = [];

    if ( conditionCase === CASE_50 )
    {
        pathTryPolygons.push({
            'points': pp_mesh,
            'stroke': 'red',
            'stroke_width': '0.1',
            'fill': 'red'
        })
    }
    else if ( conditionCase === CASE_50_500 )
    {
        pathTryPolygons.push({
            'points': pp_mesh,
            'stroke': 'red',
            'stroke_width': '1',
            'fill': 'red'
        })
    }
    else if ( conditionCase === CASE_500_2000 )
    {
        pathTryPolygons.push({
            'points': pp_mesh,
            'stroke': 'red',
            'stroke_width': '10',
            'fill': 'red'
        })
    }
    else if ( conditionCase === CASE_2000 )
    {
        pathTryPolygons.push({
            'points': pp_mesh,
            'stroke': 'red',
            'stroke_width': '20',
            'fill': 'red'
        })
    }

    console.log('pathTryPolygons:', pathTryPolygons);

    // define constraints
    var constrained_points = [];
    var constrained_status = [];
    
    console.log('constraints:', constraints)
    let constrain_poly = constraints?.map((constraint, index) => {
        return constraint.points
    });
    console.log('constrain_poly:', constrain_poly);

    [constrained_points, constrained_status] = Find_constrain_points_multi_poly (points, constrain_poly);
    
    var constraintCircles = [];
    for (i=0; i < constrained_points.length; i++) {
        if ( conditionCase === CASE_50 )
        {
            constraintCircles.push({
                'r': '0.1',
                'fill': 'blue',
                'cx': constrained_points[i][0],
                'cy': constrained_points[i][1]
            })
        }
        else if ( conditionCase === CASE_50_500 )
        {
            constraintCircles.push({
                'r': '1',
                'fill': 'blue',
                'cx': constrained_points[i][0],
                'cy': constrained_points[i][1]
            })     
        }
        else if ( conditionCase === CASE_500_2000 )
        {
            constraintCircles.push({
                'r': '25',
                'fill': 'blue',
                'cx': constrained_points[i][0],
                'cy': constrained_points[i][1]
            })
        }
        else if ( conditionCase === CASE_2000 )
        {
            constraintCircles.push({
                'r': '50',
                'fill': 'blue',
                'cx': constrained_points[i][0],
                'cy': constrained_points[i][1]
            })
        }
    }

    var Hull_Poly = [];
    var Rec_corners = [];
    var Trapezoid_corners = [];
    var Mat_Utilization ;
    
    
    
    var Mat_Utilization_Improvement = Mat_Uti_Improvement;
    
    // =============================================================================================== //
    //                                             Input                                               //
    // =============================================================================================== //
    var Incremental_step_accuracy = Mat_Uti_Steps;
    
    
    
    var Mat_Utilization_Target ;
    
    
    
    var bestFitPolygons = [];
    // =============================================================================================== //
    //                                             Step 1                                              //
    // =============================================================================================== //
    // convex hull of all points
    Hull_Poly = d3.polygonHull(points)
    
    
    // =============================================================================================== //
    
    
    // =============================================================================================== //
    //                                             Step 2                                              //
    // =============================================================================================== //
    var Area_Poly = d3.polygonArea(points)
    Rec_corners = Best_fit_Rec(Hull_Poly)
    
    // =============================================================================================== //
    
    
    // =============================================================================================== //
    //                                             Step 3                                              //
    // =============================================================================================== //
    // step 3: calculate the best fit trapezoid  Best_fit_Trapezoid
    Trapezoid_corners = Best_fit_Trapezoid(Rec_corners, Hull_Poly);
    // // plot best fit trapezoid
    var plot_Trapezoid_corners = PointsArray_to_PointsString(Trapezoid_corners);
    
    if ( conditionCase === CASE_50 )
    {
        bestFitPolygons.push({
            'points': plot_Trapezoid_corners,
            'stroke': 'green',
            'stroke_width': '0.1',
            'fill': 'none'
        })
    }
    else if ( conditionCase === CASE_50_500 )
    {
        bestFitPolygons.push({
            'points': plot_Trapezoid_corners,
            'stroke': 'green',
            'stroke_width': '1',
            'fill': 'none'
        })
    }
    else if ( conditionCase === CASE_500_2000 )
    {
        bestFitPolygons.push({
            'points': plot_Trapezoid_corners,
            'stroke': 'green',
            'stroke_width': '10',
            'fill': 'none'
        })
    }

    else if ( conditionCase === CASE_2000 )
    {
        bestFitPolygons.push({
            'points': plot_Trapezoid_corners,
            'stroke': 'green',
            'stroke_width': '20',
            'fill': 'none'
        })
    }

    var Area_Trapezoid = d3.polygonArea(Trapezoid_corners)
    Mat_Utilization = Math.abs(Area_Poly)/Area_Trapezoid;
    // calculate the material utilization
    
    
    var feature_length = Math.sqrt(Math.abs(Area_Poly))
    var Incremental_step = feature_length/ Incremental_step_accuracy;

    
    console.log("Blank Optimization Tool V 0.1");
    console.log("Material Utilization_Baseline = ", Mat_Utilization.toFixed(2));
    Mat_Utilization_Target = Mat_Utilization + Mat_Utilization_Improvement;
    console.log("Mat_Utilization_Target = ", Mat_Utilization_Target.toFixed(2));
    
  // =============================================================================================== //
  //                                             Output                                              //
  // =============================================================================================== //
    var Original_Blank_Utilization = Mat_Utilization.toFixed(2);
    var Original_Blank_Size = Area_Trapezoid;
    var Optimization_Target = Mat_Utilization_Target.toFixed(2);
    
    
    
    // =============================================================================================== //
    //                                             Step 4                                              //
    // =============================================================================================== //
    
    
    var j;
    var After_trim1;
    var After_trim2;
    var After_trim3;
    var After_trim4;
    var constrain_status_after_trim1;
    var constrain_status_after_trim2;
    var constrain_status_after_trim3;
    var constrain_status_after_trim4;
    var Area_Poly1;
    var Area_Poly2;
    var Area_Poly3;
    var Area_Poly4;
    
    var Hull_Poly1 = [];
    var Hull_Poly2 = [];
    var Hull_Poly3 = [];
    var Hull_Poly4 = [];
    
    var Rec_corners1 = [];
    var Rec_corners2 = [];
    var Rec_corners3 = [];
    var Rec_corners4 = [];
    
    var Trapezoid_corners1 = [];
    var Trapezoid_corners2 = [];
    var Trapezoid_corners3 = [];
    var Trapezoid_corners4 = [];
    
    var MatUti_after_trim = [];
    
    
    var MatUti_temp;
    var MatUti_index_temp;
    var points_remesh = [];
    var constrained_status_remesh = [];
    
    // 
    var kk=0;
    var feasibility_status = "Feasible";
    
    while (Mat_Utilization < Mat_Utilization_Target){
    
        [After_trim1, constrain_status_after_trim1] = Trim_polygon (points, Trapezoid_corners, [Trapezoid_corners[0], Trapezoid_corners[1]], Incremental_step, constrained_status);
        [After_trim2, constrain_status_after_trim2] = Trim_polygon (points, Trapezoid_corners, [Trapezoid_corners[1], Trapezoid_corners[2]], Incremental_step, constrained_status);
        [After_trim3, constrain_status_after_trim3] = Trim_polygon (points, Trapezoid_corners, [Trapezoid_corners[2], Trapezoid_corners[3]], Incremental_step, constrained_status);
        [After_trim4, constrain_status_after_trim4] = Trim_polygon (points, Trapezoid_corners, [Trapezoid_corners[3], Trapezoid_corners[0]], Incremental_step, constrained_status);
        
    
        Area_Poly1 = Math.abs(d3.polygonArea(After_trim1));
        Area_Poly2 = Math.abs(d3.polygonArea(After_trim2));
        Area_Poly3 = Math.abs(d3.polygonArea(After_trim3));
        Area_Poly4 = Math.abs(d3.polygonArea(After_trim4));
        
    
        // convex hull of all points
        Hull_Poly1 = d3.polygonHull(After_trim1)
        Hull_Poly2 = d3.polygonHull(After_trim2)
        Hull_Poly3 = d3.polygonHull(After_trim3)
        Hull_Poly4 = d3.polygonHull(After_trim4)
        
        // step 2: calculate the best fit rectangular
        Rec_corners1 = Best_fit_Rec(Hull_Poly1)
        Rec_corners2 = Best_fit_Rec(Hull_Poly2)
        Rec_corners3 = Best_fit_Rec(Hull_Poly3)
        Rec_corners4 = Best_fit_Rec(Hull_Poly4)
        
    
        Trapezoid_corners1 = Best_fit_Trapezoid(Rec_corners1, Hull_Poly1);
        Trapezoid_corners2 = Best_fit_Trapezoid(Rec_corners2, Hull_Poly2);
        Trapezoid_corners3 = Best_fit_Trapezoid(Rec_corners3, Hull_Poly3);
        Trapezoid_corners4 = Best_fit_Trapezoid(Rec_corners4, Hull_Poly4);
        
        // calculate area of trapezoid & material utilization
        MatUti_after_trim = [Area_Poly1/d3.polygonArea(Trapezoid_corners1), Area_Poly2/d3.polygonArea(Trapezoid_corners2), Area_Poly3/d3.polygonArea(Trapezoid_corners3), Area_Poly4/d3.polygonArea(Trapezoid_corners4)];
        
        
        MatUti_temp = MatUti_after_trim[0];
        MatUti_index_temp = 0;
        // find the edge with maximum material utilization
        for (i=0; i<4; i++){
            if (MatUti_temp < MatUti_after_trim[i]){
                MatUti_temp = MatUti_after_trim[i];
                MatUti_index_temp = i;
            }
        }
        
    
        
        if (MatUti_temp > Mat_Utilization){
            Mat_Utilization = MatUti_temp;
        } else {
            console.log("maximum Mat Utilization reached, Mat_Utilization = ", Mat_Utilization);
            feasibility_status = "Non-feasible";
            break
        }
    
        
        if (MatUti_index_temp === 0){
            for (j=0; j<After_trim1.length; j++){
                points[j][0] = After_trim1[j][0];
                points[j][1] = After_trim1[j][1];
                constrained_status[j] = constrain_status_after_trim1[j];
            }
            while (j < points.length){
                points.pop();
                constrained_status.pop();
            }
            for (j=0; j<4; j++){
                Trapezoid_corners[j][0] = Trapezoid_corners1[j][0];
                Trapezoid_corners[j][1] = Trapezoid_corners1[j][1];
            }
        } else if (MatUti_index_temp === 1){
            for (j=0; j<After_trim2.length; j++){
                points[j][0] = After_trim2[j][0];
                points[j][1] = After_trim2[j][1];
                constrained_status[j] = constrain_status_after_trim2[j];
            }
            while (j < points.length){
                points.pop();
                constrained_status.pop();
            }
            for (j=0; j<4; j++){
                Trapezoid_corners[j][0] = Trapezoid_corners2[j][0];
                Trapezoid_corners[j][1] = Trapezoid_corners2[j][1];
            }
        } else if (MatUti_index_temp === 2){
            for (j=0; j<After_trim3.length; j++){
                points[j][0] = After_trim3[j][0];
                points[j][1] = After_trim3[j][1];
                constrained_status[j] = constrain_status_after_trim3[j];
            }
            while (j < points.length){
                points.pop();
                constrained_status.pop();
            }
            for (j=0; j<4; j++){
                Trapezoid_corners[j][0] = Trapezoid_corners3[j][0];
                Trapezoid_corners[j][1] = Trapezoid_corners3[j][1];
            }
        } else {
            for (j=0; j<After_trim4.length; j++){
                points[j][0] = After_trim4[j][0];
                points[j][1] = After_trim4[j][1];
                constrained_status[j] = constrain_status_after_trim4[j];
            }
            while (j < points.length){
                points.pop();
                constrained_status.pop();
            }
            for (j=0; j<4; j++){
                Trapezoid_corners[j][0] = Trapezoid_corners4[j][0];
                Trapezoid_corners[j][1] = Trapezoid_corners4[j][1];
            }
        }
        
        [points_remesh, constrained_status_remesh] = polygon_edges_interpolation(points, mesh_size, constrained_status);
        for (i = 0; i<points_remesh.length; i++){
            if (i<points.length){
                points[i][0] = points_remesh[i][0];
                points[i][1] = points_remesh[i][1];
                constrained_status[i] = constrained_status_remesh[i];
            } else {
                points.push(points_remesh[i]);
                constrained_status.push(constrained_status_remesh[i]);
            }
        }
    
        kk=kk+1;
    
    }
    
    console.log("Mat_Utilization final= ", Mat_Utilization.toFixed(2));
    
    //plot the part after trimming
    var After_trim_plot = PointsArray_to_PointsString(points);
    var afterTrimPlotPolygons = [];
    if ( conditionCase === CASE_50 )
    {
        afterTrimPlotPolygons.push({
            'points': After_trim_plot,
            'stroke': 'purple',
            'stroke_width': '0.1',
            'fill': 'purple'
        })
    }
    else if ( conditionCase === CASE_50_500 )
    {
        afterTrimPlotPolygons.push({
            'points': After_trim_plot,
            'stroke': 'purple',
            'stroke_width': '2',
            'fill': 'purple'
        })
    }
    else if ( conditionCase === CASE_500_2000  )
    {
        afterTrimPlotPolygons.push({
            'points': After_trim_plot,
            'stroke': 'purple',
            'stroke_width': '5',
            'fill': 'purple'
        })
    }
    else if ( conditionCase === CASE_2000 )
    {
        afterTrimPlotPolygons.push({
            'points': After_trim_plot,
            'stroke': 'purple',
            'stroke_width': '5',
            'fill': 'purple'
        })
    }

    
    var plot_Trapezoid_corners_trim = PointsArray_to_PointsString(Trapezoid_corners);
    var plotTrapezoidCornersTrimPolygons = [];
    if ( conditionCase === CASE_50 )
    {
        plotTrapezoidCornersTrimPolygons.push({
            'points': plot_Trapezoid_corners_trim,
            'stroke': 'orange',
            'stroke_width': '0.1',
            'fill': 'none'
        })
    }
    else if ( conditionCase === CASE_50_500 )
    {
        plotTrapezoidCornersTrimPolygons.push({
            'points': plot_Trapezoid_corners_trim,
            'stroke': 'orange',
            'stroke_width': '1',
            'fill': 'none'
        })
    
    }
    else if ( conditionCase === CASE_500_2000
    )
    {
        plotTrapezoidCornersTrimPolygons.push({
            'points': plot_Trapezoid_corners_trim,
            'stroke': 'orange',
            'stroke_width': '10',
            'fill': 'none'
        })
    }
    else if ( conditionCase === CASE_2000 )
    {
        plotTrapezoidCornersTrimPolygons.push({
            'points': plot_Trapezoid_corners_trim,
            'stroke': 'orange',
            'stroke_width': '20',
            'fill': 'none'
        })
    }

    var Area_Trapezoid_Opt = d3.polygonArea(Trapezoid_corners);
    // =============================================================================================== //
    //                                             Output                                              //
    // =============================================================================================== //
    var Final_Blank_Utilization = Mat_Utilization.toFixed(2);
    var Feasibility = feasibility_status;
    var Final_Blank_Size = Area_Trapezoid_Opt;
    var Final_Blank_Size_percentage = (Final_Blank_Size/Original_Blank_Size).toFixed(2);

    return (
        <div className="OptimizeSvg">
                {/* <div className="OptimizeInfo">
                    <div className="OptimizeInfoRow">
                        <span className="OptimizeInfoTitle">Original Blank Utilization: </span><span className="OptimizeInfoValue">{ Math.round(Original_Blank_Utilization*100) }%</span>
                    </div>
                    <div className="OptimizeInfoRow">
                        <span className="OptimizeInfoTitle">Original Blank Size: </span><span className="OptimizeInfoValue">{ Original_Blank_Size.toFixed(2) }</span>
                    </div>
                    <div className="OptimizeInfoRow">
                        <span className="OptimizeInfoTitle">Optimization Target: </span><span className="OptimizeInfoValue">{ Math.round(Optimization_Target*100) } ({ Feasibility })</span>
                    </div>
                    <div className="OptimizeInfoRow">
                        <span className="OptimizeInfoTitle">Final Blank Utilization: </span><span className="OptimizeInfoValue">{ Math.round(Final_Blank_Utilization*100) }%</span>
                    </div>
                    <div className="OptimizeInfoRow">
                        <span className="OptimizeInfoTitle">Final Blank Size: </span><span className="OptimizeInfoValue">{ Final_Blank_Size.toFixed(2) } &amp; { Math.round(Final_Blank_Size_percentage*100) }%</span>
                    </div>
                </div> */}
            <svg xmlns={$('#svg' + canvasId).attr('xmlns')} viewBox={$('#svg' + canvasId).attr('viewBox')} id="svgOptimize">
                <g 
                    transform={
                        svgUpload.firstElementChild.tagName == 'g' &&
                        svgUpload.firstElementChild.hasAttribute('transform') ?
                        svgUpload.firstElementChild.getAttribute('transform') :
                        'translate(0, 0)'
                    }
                    className='viewport'
                >
                {
                    !showOptimizedBlank && constraints?.map((constraint, index) => {
                        return (
                            <polygon key={'constraint-polygon-' + index} className={"polyline polyline_" + index} stroke="red" fill="red" points={constraint?.points?.toString()}></polygon>
                        )
                    })
                }
                {
                    !showOptimizedBlank && pathTryCircles?.map((circle, index) => {
                        return (
                            <circle key={'try-path-circle-' + index} r={circle.r} fill={circle.fill} cx={circle.cx} cy={circle.cy}></circle>
                        )
                    })
                }
                {
                    !showOptimizedBlank && pathTryPolygons?.map((polygon, index) => {
                        return (
                            <polygon key={'try-path-polygon-' + index} points={polygon.points} stroke={polygon.stroke} strokeWidth={polygon.stroke_width} fill={polygon.fill}></polygon>
                        )
                    })
                }
                {
                    !showOptimizedBlank && constraintCircles?.map((circle, index) => {
                        return (
                            <circle key={'contraint-circle-' + index} r={circle.r} fill={circle.fill} cx={circle.cx} cy={circle.cy}></circle>
                        )
                    })
                }
                {
                    !showOptimizedBlank && bestFitPolygons?.map((polygon, index) => {
                        return (
                            <polygon key={'try-path-polygon-' + index} points={polygon.points} stroke={polygon.stroke} strokeWidth={polygon.stroke_width} fill={polygon.fill}></polygon>
                        )
                    })
                }
                {
                    afterTrimPlotPolygons?.map((polygon, index) => {
                        return (
                            <polygon key={'try-path-polygon-' + index} points={polygon.points} stroke={polygon.stroke} strokeWidth={polygon.stroke_width} fill={polygon.fill}></polygon>
                        )
                    })
                }
                {
                    !showOptimizedBlank && plotTrapezoidCornersTrimPolygons?.map((polygon, index) => {
                        return (
                            <polygon key={'try-path-polygon-' + index} points={polygon.points} stroke={polygon.stroke} strokeWidth={polygon.stroke_width} fill={polygon.fill}></polygon>
                        )
                    })
                }
                </g>
            </svg>
        </div>
    )
}

const UploadSVG = (props) => {
    // Set global variable on every re-render
    useEffect(() => {
        if (svgUpload == null) {
            svgUpload = document.getElementsByClassName('svg' + props.canvasId)[0]

            if(svgUpload) {
                svgDomRect = svgUpload.getBoundingClientRect()
            }
        }

        if(svgDraw == null) {
            svgDraw = document.getElementById('svgDraw')
        }

        if(svgOptimize == null) {
            svgOptimize = document.getElementById('svgOptimize')
        } 

        if(stageWrapContent == null) {
            stageWrapContent = document.getElementById('stageWrapContent');
        }

        if(pathTry == null) {
            pathTry = document.getElementById('pathTry')
        }

        if(svgRectViewInitial == null && svgUpload != null) {
            const svgRectViewBox = svgUpload.getAttribute('viewBox').split(' ')
        
            svgRectViewInitial = {
                x: svgRectViewBox[0],
                y: svgRectViewBox[1],
                width: svgRectViewBox[2],
                height: svgRectViewBox[3],
            }
        }
    })

    if(props.clear) {
        return (
            <></>
        )
    }

    return (
        <>
            <div className={['UploadSvg', 'UploadSvg' + props.canvasId].join(' ')} style={!props.visible ? {display: 'none'} : {}}>
                { HtmlToReactParser.parseWithInstructions(props.svgText, isValidNode, props.processingInstructions, props.preprocessingInstructions) }
            </div>
        </>
    )
}

const useStyles = makeStyles((theme) => ({
    cardContent: {
        height: '700px'
    },
    stageWrapContent: {
        height: '100%',
        position: 'relative'
    }
}));

const Canvas = (props) => {
    
    const classes = useStyles()
    const { canvasId } = props
    
    const uploadedMedia = useSelector((state) => state.media.uploadedMedia)
    const matUtil = useSelector((state) => state.param.parameter.matUtil)
    const numPoint = useSelector((state) => state.param.parameter.numPoint)
    const incStep = useSelector((state) => state.param.parameter.incStep)
    
    const [svgFile, setSVGFile] = useState('')
    const [clear, setClear] = useState(false)
    const [optimized, setOptimized] = useState(false)
    const [showOptimizedBlank, setShowOptimizedBlank] = useState(false)

    // variables for drawing points
    const [hideConstraints, setHideConstraints] = useState(false)
    const [constraints, setConstraints] = useState([])
    const [constraintPoints, setConstraintPoints] = useState([])
    const [constraintCount, setConstraintCount] = useState(0)
    const [eventPoints, setEventPoints] = useState([])
    const [polyLine, setPolyLine] = useState([])

    // status for edit
    const [isEditable, setIsEditable] = useState(false)

    // variables for alerts
    const [alert, setAlert] = useState(false)
    const [severity, setSeverity] = useState('')
    const [response, setResponse] = useState('')

    const preprocessingInstructions = [
        {
            shouldPreprocessNode: function (node) {
                return node.attribs && node.attribs['data-process'] === 'shared'
            },
            preprocessNode: function (node) {
                node.attribs = {id: `preprocessed-${node.attribs.id}`,}
            }
        }
    ]
    
    const processingInstructions = [
        {
            shouldProcessNode: (node) => {
                return node.tagName === 'svg'
            },
            processNode: (node, children, index) => {
                svgTagAttr = node.attribs
                node.attribs.className = 'svgUpload svg' + canvasId
                node.attribs.id = 'svg' + canvasId
    
                return processNodeDefinitions.processDefaultNode(node, children, index)
            }
        },
        {
            shouldProcessNode: function (node) {
                return node.tagName === 'path'
            },
            processNode: function (node, children, index) {
                node.attribs.id = 'pathTry' + canvasId
                node.attribs.className = 'viewport'
    
                return processNodeDefinitions.processDefaultNode(node, children, index)
            },
        },
        {
            shouldProcessNode: function (node) {
                return node.tagName === 'g'
            },
            processNode: function (node, children, index) {
                if (node.parent.tagName === 'svg') {
                    node.attribs.className = 'viewport'
                }
    
                return processNodeDefinitions.processDefaultNode(node, children, index)
            }
        },
        {
            shouldProcessNode: function (node) {
                return true
            },
    
            processNode: processNodeDefinitions.processDefaultNode,
        }
    ]
    
    useEffect(() => {
        if (uploadedMedia != null) {
            readFile()  
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uploadedMedia])

    useEffect(() => {
        console.log(constraintPoints)
    }, [constraintPoints])

    useEffect(() => {
        console.log(constraints)
    }, [constraints])

    // Append polygon points whenever they are changed
    useEffect(() => {
        console.log('PolyLine changed!', polyLine)

        if (polyLine.length) { 
            $('.polyline' + constraintCount).attr('points', polyLine.toString())
        }
    }, [polyLine])

    const handleUploadFile = () => {
        setClear(false)
    }

    const handleOptimization = () => {
        // Check if constraints is being added
        if (isEditable) {
            console.log('Editing In Progress!')
           
            return
        }

        if ($('.svg' + canvasId).length) {
            setOptimized(true)
        } else {
            console.log('Upload SVG!')
            
            return
        }
    }

    const handleClear = () => {
        setClear(true)
        setOptimized(false)
        setConstraints([])
        setConstraintPoints([])
        setConstraintCount(0)

    }

    const handleEdit = () => {
        if (isEditable) {
            $('.coordinates' + canvasId).remove()
            setConstraints([...constraints, {points: constraintPoints}])
            setConstraintPoints([])
            setPolyLine([])
        } else {
            // Increment constraint count
            setConstraintCount(constraintCount + 1)

            const svg = d3.select('.UploadSvg' + canvasId + ' > svg');
                svg.append('polygon')
                .attr('class', 'polyline' + (constraintCount + 1))
                .attr('points', polyLine.toString())
                .attr('opacity', '0.3')
                .attr('fill', 'blue')
        }

        setIsEditable(!isEditable)
    }

    const handleAlert = (action) => {
        if (action === 'close') {
            setAlert(false)
        } else {
            setAlert(true)
        }
    }

    const stageClick = (event) => {
        if ($('.svg' + canvasId).length === 0 || optimized) {
            console.log('Either No SVG Uploaded or SVG Is Oprimized!')
            return
        }

        if(!isEditable) {
            setResponse('No SVG Uploaded!')
            setSeverity('info')
            setAlert(true)

            console.log('Svg Not Uploaded')
            return
        }

        $("body").append(            
            $('<div class="coordinates coordinates'+ canvasId +'"></div>').css({
                position: 'absolute',
                top: event.pageY + 'px',
                left: event.pageX + 'px',
                width: '5px',
                height: '5px',
                background: 'black'
            })              
        )

        const svg = document.getElementsByClassName('svg' + canvasId)[0]

        if($('.svg' + canvasId).children('g:first').prop('tagName') === 'g') {
            if ($('.svg' + canvasId).children('g:first').attr('transform').indexOf('scale') > -1) {
                console.log('Clicked on svg with tansform tag having scale!')
                const transformed = svg.firstElementChild
                const pt = svg.createSVGPoint()

                // pass event coordinates
                pt.x = event.clientX
                pt.y = event.clientY
                
                // transform to SVG coordinates
                const fakesvgP = pt.matrixTransform( svg.getScreenCTM().inverse())
                const svgP = pt.matrixTransform( transformed.getScreenCTM().inverse())

                setPolyLine([...polyLine, [fakesvgP.x, fakesvgP.y]])
                setConstraintPoints([...constraintPoints, [svgP.x, svgP.y]])
            } else {
                console.log('Not')
            }
        }
        else {
            const pt = svg.createSVGPoint()   
                
            // pass event coordinates
            pt.x = event.clientX
            pt.y = event.clientY
        
            // transform to SVG coordinates
            const svgP = pt.matrixTransform(svg.getScreenCTM().inverse())
        
            setPolyLine([...polyLine, ...[svgP.x, svgP.y]])
            setConstraintPoints([...constraintPoints, [svgP.x, svgP.y]])
        }
    }

    const readFile = () => {
        let reader = new FileReader()
        reader.readAsText(uploadedMedia)

        reader.onloadend = () => {
            setSVGFile(reader.result)
        }
    }


    return (
        <>
            <Grid container>
                <Grid item xs={12}>
                    <Card 
                        variant="outlined"
                    >
                        <CardActions>
                            <Tooltip
                                title='Upload File'
                            >
                                <IconButton
                                    onClick={handleUploadFile}
                                >
                                    <UploadFileIcon />
                                </IconButton>    
                            </Tooltip>

                            <Tooltip
                                title='Optimize'
                            >
                                <IconButton
                                    onClick={handleOptimization}
                                >
                                    <SettingsSuggestIcon/>
                                </IconButton>    
                            </Tooltip>

                            <Tooltip
                                title='Clear Canvas'
                            >
                                <IconButton
                                    onClick={handleClear}
                                >
                                    <CleaningServicesIcon/>
                                </IconButton>
                            </Tooltip>

                            <Tooltip
                                title={isEditable ? 'Save Constraints' : 'Add Constraints'}
                            >
                                <IconButton
                                    onClick={handleEdit}
                                >
                                    {
                                        isEditable ? <DoneIcon /> : <EditIcon />
                                    }
                                </IconButton>
                            </Tooltip>

                            <Tooltip
                                title='Zoom In'
                            >
                                <IconButton
                                >
                                    <ZoomInIcon />
                                </IconButton>
                            </Tooltip>

                            <Tooltip
                                title='Zoom Out'
                            >
                                <IconButton
                                >
                                    <ZoomOutIcon />
                                </IconButton>
                            </Tooltip>
                        </CardActions>

                        <CardContent
                            className={classes.cardContent}
                        >
                            <div 
                                className={classes.stageWrapContent} 
                                id='stageWrapContent'    
                                onClick = {(e) => stageClick(e)}
                            >
                                <UploadSVG
                                    svgText={svgFile}
                                    visible={!optimized}
                                    clear={clear}
                                    canvasId={canvasId}
                                    preprocessingInstructions={preprocessingInstructions}
                                    processingInstructions={processingInstructions}
                                />
                                                                
                                { 
                                    optimizeSVG({
                                        optimizeParam: {
                                            percentage: matUtil,
                                            points: numPoint,
                                            steps: incStep,
                                        },
                                        constraints: constraints,
                                        visible: optimized, 
                                        clear: clear, 
                                        showOptimizedBlank: showOptimizedBlank,
                                        uploadCanvas: '.UploadSvg' + canvasId,
                                        canvasId: canvasId
                                    })
                                }
                            </div>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </>
    )
}

export default Canvas