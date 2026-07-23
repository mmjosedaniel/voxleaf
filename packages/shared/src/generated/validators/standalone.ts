/**
 * This file is generated from the canonical JSON Schema source.
 * DO NOT MODIFY IT BY HAND. Run the @voxleaf/shared generate command instead.
 */
// @ts-nocheck -- Ajv emits JavaScript; typed exports live in index.ts.
"use strict";
export const validateAudioFrameV1Wire = validate20;
const schema31 = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"urn:voxleaf:schema:audio-frame:v1","title":"AudioFrameV1Wire","description":"Privacy-safe metadata for one in-memory audio frame. Audio payload and encoding are intentionally outside this contract.","type":"object","additionalProperties":false,"required":["schemaVersion","frameId","sessionId","generationId","segmentId","sequence","sampleRateHz","sampleCountSamples","channelCount","endOfSegment"],"properties":{"schemaVersion":{"allOf":[{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion"},{"const":1}]},"frameId":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/frameId"},"sessionId":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/sessionId"},"generationId":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/generationId"},"segmentId":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/segmentId"},"sequence":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/index","description":"Monotonic frame order within the active generation."},"sampleRateHz":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/hertz"},"sampleCountSamples":{"allOf":[{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/sampleCount"},{"type":"integer","minimum":1}],"description":"Positive count of sample frames per channel; duration is this count divided by sampleRateHz."},"channelCount":{"allOf":[{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/count"},{"type":"integer","minimum":1}],"description":"Positive number of channels represented by the future payload; it does not multiply duration."},"endOfSegment":{"type":"boolean","description":"True only for the final audio frame produced for this narration segment."}}};
const schema39 = {"title":"SchemaVersionWire","type":"integer","minimum":1,"maximum":9007199254740991};
const schema33 = {"title":"IdentifierWire","type":"string","minLength":1,"maxLength":128,"pattern":"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"};
const schema41 = {"title":"IndexWire","type":"integer","minimum":0,"maximum":9007199254740991};
const schema44 = {"title":"HertzWire","type":"integer","minimum":1,"maximum":9007199254740991};
const schema43 = {"title":"SampleCountWire","type":"integer","minimum":0,"maximum":9007199254740991};
const schema40 = {"title":"CountWire","type":"integer","minimum":0,"maximum":9007199254740991};
const func1 = Object.prototype.hasOwnProperty;
function func2(value) {
  const codeUnitLength = value.length;
  let codePointLength = 0;
  let position = 0;
  let codeUnit;

  while (position < codeUnitLength) {
    codePointLength += 1;
    codeUnit = value.charCodeAt(position);
    position += 1;
    if (
      codeUnit >= 0xd800 &&
      codeUnit <= 0xdbff &&
      position < codeUnitLength
    ) {
      codeUnit = value.charCodeAt(position);
      if ((codeUnit & 0xfc00) === 0xdc00) position += 1;
    }
  }

  return codePointLength;
}
const pattern4 = new RegExp("^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$", "u");

function validate20(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="urn:voxleaf:schema:audio-frame:v1" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate20.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.schemaVersion === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "schemaVersion"},message:"must have required property '"+"schemaVersion"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.frameId === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "frameId"},message:"must have required property '"+"frameId"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.sessionId === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sessionId"},message:"must have required property '"+"sessionId"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.generationId === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "generationId"},message:"must have required property '"+"generationId"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.segmentId === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "segmentId"},message:"must have required property '"+"segmentId"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.sequence === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sequence"},message:"must have required property '"+"sequence"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data.sampleRateHz === undefined){
const err6 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sampleRateHz"},message:"must have required property '"+"sampleRateHz"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(data.sampleCountSamples === undefined){
const err7 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sampleCountSamples"},message:"must have required property '"+"sampleCountSamples"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(data.channelCount === undefined){
const err8 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "channelCount"},message:"must have required property '"+"channelCount"+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(data.endOfSegment === undefined){
const err9 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "endOfSegment"},message:"must have required property '"+"endOfSegment"+"'"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
for(const key0 in data){
if(!(func1.call(schema31.properties, key0))){
const err10 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
if(data.schemaVersion !== undefined){
let data0 = data.schemaVersion;
if(!(((typeof data0 == "number") && (!(data0 % 1) && !isNaN(data0))) && (isFinite(data0)))){
const err11 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
if((typeof data0 == "number") && (isFinite(data0))){
if(data0 > 9007199254740991 || isNaN(data0)){
const err12 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
if(data0 < 1 || isNaN(data0)){
const err13 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
if(1 !== data0){
const err14 = {instancePath:instancePath+"/schemaVersion",schemaPath:"#/properties/schemaVersion/allOf/1/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
if(data.frameId !== undefined){
let data1 = data.frameId;
if(typeof data1 === "string"){
if(func2(data1) > 128){
const err15 = {instancePath:instancePath+"/frameId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/frameId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
if(func2(data1) < 1){
const err16 = {instancePath:instancePath+"/frameId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/frameId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
if(!pattern4.test(data1)){
const err17 = {instancePath:instancePath+"/frameId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/frameId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
else {
const err18 = {instancePath:instancePath+"/frameId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/frameId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
if(data.sessionId !== undefined){
let data2 = data.sessionId;
if(typeof data2 === "string"){
if(func2(data2) > 128){
const err19 = {instancePath:instancePath+"/sessionId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/sessionId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
if(func2(data2) < 1){
const err20 = {instancePath:instancePath+"/sessionId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/sessionId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
if(!pattern4.test(data2)){
const err21 = {instancePath:instancePath+"/sessionId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/sessionId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
else {
const err22 = {instancePath:instancePath+"/sessionId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/sessionId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
if(data.generationId !== undefined){
let data3 = data.generationId;
if(typeof data3 === "string"){
if(func2(data3) > 128){
const err23 = {instancePath:instancePath+"/generationId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/generationId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
if(func2(data3) < 1){
const err24 = {instancePath:instancePath+"/generationId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/generationId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
if(!pattern4.test(data3)){
const err25 = {instancePath:instancePath+"/generationId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/generationId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
else {
const err26 = {instancePath:instancePath+"/generationId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/generationId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
if(data.segmentId !== undefined){
let data4 = data.segmentId;
if(typeof data4 === "string"){
if(func2(data4) > 128){
const err27 = {instancePath:instancePath+"/segmentId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/segmentId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
if(func2(data4) < 1){
const err28 = {instancePath:instancePath+"/segmentId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/segmentId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
if(!pattern4.test(data4)){
const err29 = {instancePath:instancePath+"/segmentId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/segmentId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
}
else {
const err30 = {instancePath:instancePath+"/segmentId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/segmentId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
}
if(data.sequence !== undefined){
let data5 = data.sequence;
if(!(((typeof data5 == "number") && (!(data5 % 1) && !isNaN(data5))) && (isFinite(data5)))){
const err31 = {instancePath:instancePath+"/sequence",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/index/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
if((typeof data5 == "number") && (isFinite(data5))){
if(data5 > 9007199254740991 || isNaN(data5)){
const err32 = {instancePath:instancePath+"/sequence",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/index/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
if(data5 < 0 || isNaN(data5)){
const err33 = {instancePath:instancePath+"/sequence",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/index/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
}
}
if(data.sampleRateHz !== undefined){
let data6 = data.sampleRateHz;
if(!(((typeof data6 == "number") && (!(data6 % 1) && !isNaN(data6))) && (isFinite(data6)))){
const err34 = {instancePath:instancePath+"/sampleRateHz",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/hertz/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
if((typeof data6 == "number") && (isFinite(data6))){
if(data6 > 9007199254740991 || isNaN(data6)){
const err35 = {instancePath:instancePath+"/sampleRateHz",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/hertz/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
if(data6 < 1 || isNaN(data6)){
const err36 = {instancePath:instancePath+"/sampleRateHz",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/hertz/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
}
}
if(data.sampleCountSamples !== undefined){
let data7 = data.sampleCountSamples;
if(!(((typeof data7 == "number") && (!(data7 % 1) && !isNaN(data7))) && (isFinite(data7)))){
const err37 = {instancePath:instancePath+"/sampleCountSamples",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/sampleCount/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
if((typeof data7 == "number") && (isFinite(data7))){
if(data7 > 9007199254740991 || isNaN(data7)){
const err38 = {instancePath:instancePath+"/sampleCountSamples",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/sampleCount/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
if(data7 < 0 || isNaN(data7)){
const err39 = {instancePath:instancePath+"/sampleCountSamples",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/sampleCount/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err39];
}
else {
vErrors.push(err39);
}
errors++;
}
}
if(!(((typeof data7 == "number") && (!(data7 % 1) && !isNaN(data7))) && (isFinite(data7)))){
const err40 = {instancePath:instancePath+"/sampleCountSamples",schemaPath:"#/properties/sampleCountSamples/allOf/1/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err40];
}
else {
vErrors.push(err40);
}
errors++;
}
if((typeof data7 == "number") && (isFinite(data7))){
if(data7 < 1 || isNaN(data7)){
const err41 = {instancePath:instancePath+"/sampleCountSamples",schemaPath:"#/properties/sampleCountSamples/allOf/1/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err41];
}
else {
vErrors.push(err41);
}
errors++;
}
}
}
if(data.channelCount !== undefined){
let data8 = data.channelCount;
if(!(((typeof data8 == "number") && (!(data8 % 1) && !isNaN(data8))) && (isFinite(data8)))){
const err42 = {instancePath:instancePath+"/channelCount",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/count/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err42];
}
else {
vErrors.push(err42);
}
errors++;
}
if((typeof data8 == "number") && (isFinite(data8))){
if(data8 > 9007199254740991 || isNaN(data8)){
const err43 = {instancePath:instancePath+"/channelCount",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/count/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err43];
}
else {
vErrors.push(err43);
}
errors++;
}
if(data8 < 0 || isNaN(data8)){
const err44 = {instancePath:instancePath+"/channelCount",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/count/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err44];
}
else {
vErrors.push(err44);
}
errors++;
}
}
if(!(((typeof data8 == "number") && (!(data8 % 1) && !isNaN(data8))) && (isFinite(data8)))){
const err45 = {instancePath:instancePath+"/channelCount",schemaPath:"#/properties/channelCount/allOf/1/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err45];
}
else {
vErrors.push(err45);
}
errors++;
}
if((typeof data8 == "number") && (isFinite(data8))){
if(data8 < 1 || isNaN(data8)){
const err46 = {instancePath:instancePath+"/channelCount",schemaPath:"#/properties/channelCount/allOf/1/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err46];
}
else {
vErrors.push(err46);
}
errors++;
}
}
}
if(data.endOfSegment !== undefined){
if(typeof data.endOfSegment !== "boolean"){
const err47 = {instancePath:instancePath+"/endOfSegment",schemaPath:"#/properties/endOfSegment/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err47];
}
else {
vErrors.push(err47);
}
errors++;
}
}
}
else {
const err48 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err48];
}
else {
vErrors.push(err48);
}
errors++;
}
validate20.errors = vErrors;
return errors === 0;
}
validate20.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateBookV1Wire = validate22;
const schema56 = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"urn:voxleaf:schema:book:v1","title":"BookV1Wire","description":"Privacy-safe structural metadata for one opened book.","type":"object","additionalProperties":false,"required":["schemaVersion","identity","metadata","resources","spine","navigation"],"properties":{"schemaVersion":{"allOf":[{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion"},{"const":1}]},"identity":{"$ref":"#/$defs/bookIdentity"},"metadata":{"$ref":"#/$defs/publicationMetadata"},"resources":{"type":"array","minItems":1,"maxItems":50000,"items":{"$ref":"#/$defs/localResource"}},"spine":{"type":"array","minItems":1,"maxItems":10000,"items":{"$ref":"#/$defs/spineItem"}},"navigation":{"type":"array","maxItems":10000,"items":{"$ref":"#/$defs/navigationEntry"}}},"$defs":{"boundedText":{"type":"string","minLength":1,"maxLength":1024,"pattern":"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},"bookIdentity":{"title":"BookIdentityV1Wire","type":"object","additionalProperties":false,"required":["scheme","schemeVersion","value"],"properties":{"scheme":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[a-z][a-z0-9-]*$"},"schemeVersion":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion"},"value":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/bookId","type":"string","maxLength":512,"pattern":"^[A-Za-z0-9._~-]+$"}}},"publicationMetadata":{"title":"PublicationMetadataV1Wire","type":"object","additionalProperties":false,"required":["title","authors"],"properties":{"title":{"$ref":"#/$defs/boundedText"},"authors":{"type":"array","maxItems":128,"uniqueItems":true,"items":{"$ref":"#/$defs/boundedText"}}}},"localResourcePath":{"title":"LocalResourcePathWire","type":"string","minLength":1,"maxLength":2048,"pattern":"^(?!/)(?![A-Za-z][A-Za-z0-9+.-]*:)(?!.*//)(?!.*(?:^|/)\\.\\.?(?:/|$))(?!.*[\\\\?#])(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},"localResource":{"title":"LocalResourceV1Wire","type":"object","additionalProperties":false,"required":["path","mediaType","role"],"properties":{"path":{"$ref":"#/$defs/localResourcePath"},"mediaType":{"type":"string","minLength":3,"maxLength":127,"pattern":"^[a-z0-9!#$&^_.+-]+/[a-z0-9!#$&^_.+-]+$"},"role":{"type":"string","enum":["content-document","image"]}}},"spineItem":{"title":"SpineItemV1Wire","type":"object","additionalProperties":false,"required":["id","index","resourcePath"],"properties":{"id":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/spineItemId"},"index":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/index"},"resourcePath":{"$ref":"#/$defs/localResourcePath"}}},"navigationEntry":{"title":"NavigationEntryV1Wire","type":"object","additionalProperties":false,"required":["label","targetSpineItemId"],"properties":{"label":{"$ref":"#/$defs/boundedText"},"targetSpineItemId":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/spineItemId"}}}}};
const schema58 = {"title":"BookIdentityV1Wire","type":"object","additionalProperties":false,"required":["scheme","schemeVersion","value"],"properties":{"scheme":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[a-z][a-z0-9-]*$"},"schemeVersion":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion"},"value":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/bookId","type":"string","maxLength":512,"pattern":"^[A-Za-z0-9._~-]+$"}}};
const pattern14 = new RegExp("^[a-z][a-z0-9-]*$", "u");
const pattern16 = new RegExp("^[A-Za-z0-9._~-]+$", "u");

function validate23(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate23.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.scheme === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "scheme"},message:"must have required property '"+"scheme"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.schemeVersion === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "schemeVersion"},message:"must have required property '"+"schemeVersion"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.value === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "value"},message:"must have required property '"+"value"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
for(const key0 in data){
if(!(((key0 === "scheme") || (key0 === "schemeVersion")) || (key0 === "value"))){
const err3 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.scheme !== undefined){
let data0 = data.scheme;
if(typeof data0 === "string"){
if(func2(data0) > 64){
const err4 = {instancePath:instancePath+"/scheme",schemaPath:"#/properties/scheme/maxLength",keyword:"maxLength",params:{limit: 64},message:"must NOT have more than 64 characters"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(func2(data0) < 1){
const err5 = {instancePath:instancePath+"/scheme",schemaPath:"#/properties/scheme/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(!pattern14.test(data0)){
const err6 = {instancePath:instancePath+"/scheme",schemaPath:"#/properties/scheme/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9-]*$"},message:"must match pattern \""+"^[a-z][a-z0-9-]*$"+"\""};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
else {
const err7 = {instancePath:instancePath+"/scheme",schemaPath:"#/properties/scheme/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.schemeVersion !== undefined){
let data1 = data.schemeVersion;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err8 = {instancePath:instancePath+"/schemeVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if((typeof data1 == "number") && (isFinite(data1))){
if(data1 > 9007199254740991 || isNaN(data1)){
const err9 = {instancePath:instancePath+"/schemeVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(data1 < 1 || isNaN(data1)){
const err10 = {instancePath:instancePath+"/schemeVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
}
if(data.value !== undefined){
let data2 = data.value;
if(typeof data2 === "string"){
if(func2(data2) > 128){
const err11 = {instancePath:instancePath+"/value",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/bookId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
if(func2(data2) < 1){
const err12 = {instancePath:instancePath+"/value",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/bookId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
if(!pattern4.test(data2)){
const err13 = {instancePath:instancePath+"/value",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/bookId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
else {
const err14 = {instancePath:instancePath+"/value",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/bookId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
if(typeof data2 === "string"){
if(func2(data2) > 512){
const err15 = {instancePath:instancePath+"/value",schemaPath:"#/properties/value/maxLength",keyword:"maxLength",params:{limit: 512},message:"must NOT have more than 512 characters"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
if(!pattern16.test(data2)){
const err16 = {instancePath:instancePath+"/value",schemaPath:"#/properties/value/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z0-9._~-]+$"},message:"must match pattern \""+"^[A-Za-z0-9._~-]+$"+"\""};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
else {
const err17 = {instancePath:instancePath+"/value",schemaPath:"#/properties/value/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
}
else {
const err18 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
validate23.errors = vErrors;
return errors === 0;
}
validate23.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema61 = {"title":"PublicationMetadataV1Wire","type":"object","additionalProperties":false,"required":["title","authors"],"properties":{"title":{"$ref":"#/$defs/boundedText"},"authors":{"type":"array","maxItems":128,"uniqueItems":true,"items":{"$ref":"#/$defs/boundedText"}}}};
const schema62 = {"type":"string","minLength":1,"maxLength":1024,"pattern":"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"};
function func0(left, right) {
  if (left === right) return true;

  if (
    left &&
    right &&
    typeof left === "object" &&
    typeof right === "object"
  ) {
    if (left.constructor !== right.constructor) return false;

    let length;
    let index;
    let keys;
    if (Array.isArray(left)) {
      length = left.length;
      if (length !== right.length) return false;
      for (index = length; index-- !== 0; ) {
        if (!func0(left[index], right[index])) return false;
      }
      return true;
    }

    if (left.constructor === RegExp) {
      return left.source === right.source && left.flags === right.flags;
    }
    if (left.valueOf !== Object.prototype.valueOf) {
      return left.valueOf() === right.valueOf();
    }
    if (left.toString !== Object.prototype.toString) {
      return left.toString() === right.toString();
    }

    keys = Object.keys(left);
    length = keys.length;
    if (length !== Object.keys(right).length) return false;

    for (index = length; index-- !== 0; ) {
      if (!Object.prototype.hasOwnProperty.call(right, keys[index])) return false;
    }
    for (index = length; index-- !== 0; ) {
      const key = keys[index];
      if (!func0(left[key], right[key])) return false;
    }

    return true;
  }

  return left !== left && right !== right;
}

function validate25(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate25.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.title === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "title"},message:"must have required property '"+"title"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.authors === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "authors"},message:"must have required property '"+"authors"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
for(const key0 in data){
if(!((key0 === "title") || (key0 === "authors"))){
const err2 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
if(data.title !== undefined){
let data0 = data.title;
if(typeof data0 === "string"){
if(func2(data0) > 1024){
const err3 = {instancePath:instancePath+"/title",schemaPath:"#/$defs/boundedText/maxLength",keyword:"maxLength",params:{limit: 1024},message:"must NOT have more than 1024 characters"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(func2(data0) < 1){
const err4 = {instancePath:instancePath+"/title",schemaPath:"#/$defs/boundedText/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(!pattern4.test(data0)){
const err5 = {instancePath:instancePath+"/title",schemaPath:"#/$defs/boundedText/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
else {
const err6 = {instancePath:instancePath+"/title",schemaPath:"#/$defs/boundedText/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data.authors !== undefined){
let data1 = data.authors;
if(Array.isArray(data1)){
if(data1.length > 128){
const err7 = {instancePath:instancePath+"/authors",schemaPath:"#/properties/authors/maxItems",keyword:"maxItems",params:{limit: 128},message:"must NOT have more than 128 items"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
const len0 = data1.length;
for(let i0=0; i0<len0; i0++){
let data2 = data1[i0];
if(typeof data2 === "string"){
if(func2(data2) > 1024){
const err8 = {instancePath:instancePath+"/authors/" + i0,schemaPath:"#/$defs/boundedText/maxLength",keyword:"maxLength",params:{limit: 1024},message:"must NOT have more than 1024 characters"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(func2(data2) < 1){
const err9 = {instancePath:instancePath+"/authors/" + i0,schemaPath:"#/$defs/boundedText/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(!pattern4.test(data2)){
const err10 = {instancePath:instancePath+"/authors/" + i0,schemaPath:"#/$defs/boundedText/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
else {
const err11 = {instancePath:instancePath+"/authors/" + i0,schemaPath:"#/$defs/boundedText/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
let i1 = data1.length;
let j0;
if(i1 > 1){
outer0:
for(;i1--;){
for(j0 = i1; j0--;){
if(func0(data1[i1], data1[j0])){
const err12 = {instancePath:instancePath+"/authors",schemaPath:"#/properties/authors/uniqueItems",keyword:"uniqueItems",params:{i: i1, j: j0},message:"must NOT have duplicate items (items ## "+j0+" and "+i1+" are identical)"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
break outer0;
}
}
}
}
}
else {
const err13 = {instancePath:instancePath+"/authors",schemaPath:"#/properties/authors/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
}
else {
const err14 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
validate25.errors = vErrors;
return errors === 0;
}
validate25.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema64 = {"title":"LocalResourceV1Wire","type":"object","additionalProperties":false,"required":["path","mediaType","role"],"properties":{"path":{"$ref":"#/$defs/localResourcePath"},"mediaType":{"type":"string","minLength":3,"maxLength":127,"pattern":"^[a-z0-9!#$&^_.+-]+/[a-z0-9!#$&^_.+-]+$"},"role":{"type":"string","enum":["content-document","image"]}}};
const schema65 = {"title":"LocalResourcePathWire","type":"string","minLength":1,"maxLength":2048,"pattern":"^(?!/)(?![A-Za-z][A-Za-z0-9+.-]*:)(?!.*//)(?!.*(?:^|/)\\.\\.?(?:/|$))(?!.*[\\\\?#])(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"};
const pattern19 = new RegExp("^(?!/)(?![A-Za-z][A-Za-z0-9+.-]*:)(?!.*//)(?!.*(?:^|/)\\.\\.?(?:/|$))(?!.*[\\\\?#])(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$", "u");
const pattern20 = new RegExp("^[a-z0-9!#$&^_.+-]+/[a-z0-9!#$&^_.+-]+$", "u");

function validate27(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate27.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.path === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "path"},message:"must have required property '"+"path"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.mediaType === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "mediaType"},message:"must have required property '"+"mediaType"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.role === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "role"},message:"must have required property '"+"role"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
for(const key0 in data){
if(!(((key0 === "path") || (key0 === "mediaType")) || (key0 === "role"))){
const err3 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.path !== undefined){
let data0 = data.path;
if(typeof data0 === "string"){
if(func2(data0) > 2048){
const err4 = {instancePath:instancePath+"/path",schemaPath:"#/$defs/localResourcePath/maxLength",keyword:"maxLength",params:{limit: 2048},message:"must NOT have more than 2048 characters"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(func2(data0) < 1){
const err5 = {instancePath:instancePath+"/path",schemaPath:"#/$defs/localResourcePath/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(!pattern19.test(data0)){
const err6 = {instancePath:instancePath+"/path",schemaPath:"#/$defs/localResourcePath/pattern",keyword:"pattern",params:{pattern: "^(?!/)(?![A-Za-z][A-Za-z0-9+.-]*:)(?!.*//)(?!.*(?:^|/)\\.\\.?(?:/|$))(?!.*[\\\\?#])(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!/)(?![A-Za-z][A-Za-z0-9+.-]*:)(?!.*//)(?!.*(?:^|/)\\.\\.?(?:/|$))(?!.*[\\\\?#])(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
else {
const err7 = {instancePath:instancePath+"/path",schemaPath:"#/$defs/localResourcePath/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.mediaType !== undefined){
let data1 = data.mediaType;
if(typeof data1 === "string"){
if(func2(data1) > 127){
const err8 = {instancePath:instancePath+"/mediaType",schemaPath:"#/properties/mediaType/maxLength",keyword:"maxLength",params:{limit: 127},message:"must NOT have more than 127 characters"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(func2(data1) < 3){
const err9 = {instancePath:instancePath+"/mediaType",schemaPath:"#/properties/mediaType/minLength",keyword:"minLength",params:{limit: 3},message:"must NOT have fewer than 3 characters"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(!pattern20.test(data1)){
const err10 = {instancePath:instancePath+"/mediaType",schemaPath:"#/properties/mediaType/pattern",keyword:"pattern",params:{pattern: "^[a-z0-9!#$&^_.+-]+/[a-z0-9!#$&^_.+-]+$"},message:"must match pattern \""+"^[a-z0-9!#$&^_.+-]+/[a-z0-9!#$&^_.+-]+$"+"\""};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
else {
const err11 = {instancePath:instancePath+"/mediaType",schemaPath:"#/properties/mediaType/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(data.role !== undefined){
let data2 = data.role;
if(typeof data2 !== "string"){
const err12 = {instancePath:instancePath+"/role",schemaPath:"#/properties/role/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
if(!((data2 === "content-document") || (data2 === "image"))){
const err13 = {instancePath:instancePath+"/role",schemaPath:"#/properties/role/enum",keyword:"enum",params:{allowedValues: schema64.properties.role.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
}
else {
const err14 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
validate27.errors = vErrors;
return errors === 0;
}
validate27.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema66 = {"title":"SpineItemV1Wire","type":"object","additionalProperties":false,"required":["id","index","resourcePath"],"properties":{"id":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/spineItemId"},"index":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/index"},"resourcePath":{"$ref":"#/$defs/localResourcePath"}}};

function validate29(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate29.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.id === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.index === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "index"},message:"must have required property '"+"index"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.resourcePath === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "resourcePath"},message:"must have required property '"+"resourcePath"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
for(const key0 in data){
if(!(((key0 === "id") || (key0 === "index")) || (key0 === "resourcePath"))){
const err3 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.id !== undefined){
let data0 = data.id;
if(typeof data0 === "string"){
if(func2(data0) > 128){
const err4 = {instancePath:instancePath+"/id",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/spineItemId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(func2(data0) < 1){
const err5 = {instancePath:instancePath+"/id",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/spineItemId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(!pattern4.test(data0)){
const err6 = {instancePath:instancePath+"/id",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/spineItemId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
else {
const err7 = {instancePath:instancePath+"/id",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/spineItemId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.index !== undefined){
let data1 = data.index;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err8 = {instancePath:instancePath+"/index",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/index/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if((typeof data1 == "number") && (isFinite(data1))){
if(data1 > 9007199254740991 || isNaN(data1)){
const err9 = {instancePath:instancePath+"/index",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/index/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(data1 < 0 || isNaN(data1)){
const err10 = {instancePath:instancePath+"/index",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/index/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
}
if(data.resourcePath !== undefined){
let data2 = data.resourcePath;
if(typeof data2 === "string"){
if(func2(data2) > 2048){
const err11 = {instancePath:instancePath+"/resourcePath",schemaPath:"#/$defs/localResourcePath/maxLength",keyword:"maxLength",params:{limit: 2048},message:"must NOT have more than 2048 characters"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
if(func2(data2) < 1){
const err12 = {instancePath:instancePath+"/resourcePath",schemaPath:"#/$defs/localResourcePath/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
if(!pattern19.test(data2)){
const err13 = {instancePath:instancePath+"/resourcePath",schemaPath:"#/$defs/localResourcePath/pattern",keyword:"pattern",params:{pattern: "^(?!/)(?![A-Za-z][A-Za-z0-9+.-]*:)(?!.*//)(?!.*(?:^|/)\\.\\.?(?:/|$))(?!.*[\\\\?#])(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!/)(?![A-Za-z][A-Za-z0-9+.-]*:)(?!.*//)(?!.*(?:^|/)\\.\\.?(?:/|$))(?!.*[\\\\?#])(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
else {
const err14 = {instancePath:instancePath+"/resourcePath",schemaPath:"#/$defs/localResourcePath/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
}
else {
const err15 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
validate29.errors = vErrors;
return errors === 0;
}
validate29.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema70 = {"title":"NavigationEntryV1Wire","type":"object","additionalProperties":false,"required":["label","targetSpineItemId"],"properties":{"label":{"$ref":"#/$defs/boundedText"},"targetSpineItemId":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/spineItemId"}}};

function validate31(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate31.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.label === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "label"},message:"must have required property '"+"label"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.targetSpineItemId === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "targetSpineItemId"},message:"must have required property '"+"targetSpineItemId"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
for(const key0 in data){
if(!((key0 === "label") || (key0 === "targetSpineItemId"))){
const err2 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
if(data.label !== undefined){
let data0 = data.label;
if(typeof data0 === "string"){
if(func2(data0) > 1024){
const err3 = {instancePath:instancePath+"/label",schemaPath:"#/$defs/boundedText/maxLength",keyword:"maxLength",params:{limit: 1024},message:"must NOT have more than 1024 characters"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(func2(data0) < 1){
const err4 = {instancePath:instancePath+"/label",schemaPath:"#/$defs/boundedText/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(!pattern4.test(data0)){
const err5 = {instancePath:instancePath+"/label",schemaPath:"#/$defs/boundedText/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
else {
const err6 = {instancePath:instancePath+"/label",schemaPath:"#/$defs/boundedText/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data.targetSpineItemId !== undefined){
let data1 = data.targetSpineItemId;
if(typeof data1 === "string"){
if(func2(data1) > 128){
const err7 = {instancePath:instancePath+"/targetSpineItemId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/spineItemId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(func2(data1) < 1){
const err8 = {instancePath:instancePath+"/targetSpineItemId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/spineItemId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(!pattern4.test(data1)){
const err9 = {instancePath:instancePath+"/targetSpineItemId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/spineItemId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
else {
const err10 = {instancePath:instancePath+"/targetSpineItemId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/spineItemId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
}
else {
const err11 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
validate31.errors = vErrors;
return errors === 0;
}
validate31.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate22(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="urn:voxleaf:schema:book:v1" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate22.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.schemaVersion === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "schemaVersion"},message:"must have required property '"+"schemaVersion"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.identity === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "identity"},message:"must have required property '"+"identity"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.metadata === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "metadata"},message:"must have required property '"+"metadata"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.resources === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "resources"},message:"must have required property '"+"resources"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.spine === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "spine"},message:"must have required property '"+"spine"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.navigation === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "navigation"},message:"must have required property '"+"navigation"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
for(const key0 in data){
if(!((((((key0 === "schemaVersion") || (key0 === "identity")) || (key0 === "metadata")) || (key0 === "resources")) || (key0 === "spine")) || (key0 === "navigation"))){
const err6 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data.schemaVersion !== undefined){
let data0 = data.schemaVersion;
if(!(((typeof data0 == "number") && (!(data0 % 1) && !isNaN(data0))) && (isFinite(data0)))){
const err7 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if((typeof data0 == "number") && (isFinite(data0))){
if(data0 > 9007199254740991 || isNaN(data0)){
const err8 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(data0 < 1 || isNaN(data0)){
const err9 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
if(1 !== data0){
const err10 = {instancePath:instancePath+"/schemaVersion",schemaPath:"#/properties/schemaVersion/allOf/1/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
if(data.identity !== undefined){
if(!(validate23(data.identity, {instancePath:instancePath+"/identity",parentData:data,parentDataProperty:"identity",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate23.errors : vErrors.concat(validate23.errors);
errors = vErrors.length;
}
}
if(data.metadata !== undefined){
if(!(validate25(data.metadata, {instancePath:instancePath+"/metadata",parentData:data,parentDataProperty:"metadata",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
errors = vErrors.length;
}
}
if(data.resources !== undefined){
let data3 = data.resources;
if(Array.isArray(data3)){
if(data3.length > 50000){
const err11 = {instancePath:instancePath+"/resources",schemaPath:"#/properties/resources/maxItems",keyword:"maxItems",params:{limit: 50000},message:"must NOT have more than 50000 items"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
if(data3.length < 1){
const err12 = {instancePath:instancePath+"/resources",schemaPath:"#/properties/resources/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
const len0 = data3.length;
for(let i0=0; i0<len0; i0++){
if(!(validate27(data3[i0], {instancePath:instancePath+"/resources/" + i0,parentData:data3,parentDataProperty:i0,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate27.errors : vErrors.concat(validate27.errors);
errors = vErrors.length;
}
}
}
else {
const err13 = {instancePath:instancePath+"/resources",schemaPath:"#/properties/resources/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
if(data.spine !== undefined){
let data5 = data.spine;
if(Array.isArray(data5)){
if(data5.length > 10000){
const err14 = {instancePath:instancePath+"/spine",schemaPath:"#/properties/spine/maxItems",keyword:"maxItems",params:{limit: 10000},message:"must NOT have more than 10000 items"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
if(data5.length < 1){
const err15 = {instancePath:instancePath+"/spine",schemaPath:"#/properties/spine/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
const len1 = data5.length;
for(let i1=0; i1<len1; i1++){
if(!(validate29(data5[i1], {instancePath:instancePath+"/spine/" + i1,parentData:data5,parentDataProperty:i1,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate29.errors : vErrors.concat(validate29.errors);
errors = vErrors.length;
}
}
}
else {
const err16 = {instancePath:instancePath+"/spine",schemaPath:"#/properties/spine/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
if(data.navigation !== undefined){
let data7 = data.navigation;
if(Array.isArray(data7)){
if(data7.length > 10000){
const err17 = {instancePath:instancePath+"/navigation",schemaPath:"#/properties/navigation/maxItems",keyword:"maxItems",params:{limit: 10000},message:"must NOT have more than 10000 items"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
const len2 = data7.length;
for(let i2=0; i2<len2; i2++){
if(!(validate31(data7[i2], {instancePath:instancePath+"/navigation/" + i2,parentData:data7,parentDataProperty:i2,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate31.errors : vErrors.concat(validate31.errors);
errors = vErrors.length;
}
}
}
else {
const err18 = {instancePath:instancePath+"/navigation",schemaPath:"#/properties/navigation/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
}
else {
const err19 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
validate22.errors = vErrors;
return errors === 0;
}
validate22.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateBufferStatusV1Wire = validate33;
const schema73 = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"urn:voxleaf:schema:buffer-status:v1","title":"BufferStatusV1Wire","description":"A payload-free snapshot of bounded playable-audio status for one active session and generation.","type":"object","additionalProperties":false,"required":["schemaVersion","sessionId","generationId","contiguousPlayableDurationMs","thresholds","underrunCount","state"],"properties":{"schemaVersion":{"allOf":[{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion"},{"const":1}]},"sessionId":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/sessionId"},"generationId":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/generationId"},"contiguousPlayableDurationMs":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/milliseconds","description":"Contiguous media duration currently available to the player; this is not elapsed wall-clock time."},"thresholds":{"$ref":"#/$defs/bufferThresholds"},"underrunCount":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/count","description":"Count of observed involuntary transitions from playback to buffering for this session and generation."},"state":{"$ref":"#/$defs/bufferState"}},"$defs":{"bufferThresholds":{"title":"BufferThresholdsV1Wire","type":"object","additionalProperties":false,"required":["lowWaterMarkMs","targetBufferMs","maximumBufferMs"],"properties":{"lowWaterMarkMs":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/milliseconds"},"targetBufferMs":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/milliseconds"},"maximumBufferMs":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/milliseconds"}}},"bufferState":{"title":"BufferStateV1Wire","type":"string","enum":["empty","buffering","ready","playing","paused"],"description":"Exhaustion while more audio is expected is represented as buffering, not as a separate terminal state."}}};
const schema42 = {"title":"MillisecondsWire","type":"integer","minimum":0,"maximum":9007199254740991};
const schema83 = {"title":"BufferStateV1Wire","type":"string","enum":["empty","buffering","ready","playing","paused"],"description":"Exhaustion while more audio is expected is represented as buffering, not as a separate terminal state."};
const schema78 = {"title":"BufferThresholdsV1Wire","type":"object","additionalProperties":false,"required":["lowWaterMarkMs","targetBufferMs","maximumBufferMs"],"properties":{"lowWaterMarkMs":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/milliseconds"},"targetBufferMs":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/milliseconds"},"maximumBufferMs":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/milliseconds"}}};

function validate34(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate34.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.lowWaterMarkMs === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "lowWaterMarkMs"},message:"must have required property '"+"lowWaterMarkMs"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.targetBufferMs === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "targetBufferMs"},message:"must have required property '"+"targetBufferMs"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.maximumBufferMs === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "maximumBufferMs"},message:"must have required property '"+"maximumBufferMs"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
for(const key0 in data){
if(!(((key0 === "lowWaterMarkMs") || (key0 === "targetBufferMs")) || (key0 === "maximumBufferMs"))){
const err3 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.lowWaterMarkMs !== undefined){
let data0 = data.lowWaterMarkMs;
if(!(((typeof data0 == "number") && (!(data0 % 1) && !isNaN(data0))) && (isFinite(data0)))){
const err4 = {instancePath:instancePath+"/lowWaterMarkMs",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/milliseconds/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if((typeof data0 == "number") && (isFinite(data0))){
if(data0 > 9007199254740991 || isNaN(data0)){
const err5 = {instancePath:instancePath+"/lowWaterMarkMs",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/milliseconds/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data0 < 0 || isNaN(data0)){
const err6 = {instancePath:instancePath+"/lowWaterMarkMs",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/milliseconds/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
}
if(data.targetBufferMs !== undefined){
let data1 = data.targetBufferMs;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err7 = {instancePath:instancePath+"/targetBufferMs",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/milliseconds/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if((typeof data1 == "number") && (isFinite(data1))){
if(data1 > 9007199254740991 || isNaN(data1)){
const err8 = {instancePath:instancePath+"/targetBufferMs",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/milliseconds/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(data1 < 0 || isNaN(data1)){
const err9 = {instancePath:instancePath+"/targetBufferMs",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/milliseconds/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
}
if(data.maximumBufferMs !== undefined){
let data2 = data.maximumBufferMs;
if(!(((typeof data2 == "number") && (!(data2 % 1) && !isNaN(data2))) && (isFinite(data2)))){
const err10 = {instancePath:instancePath+"/maximumBufferMs",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/milliseconds/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if((typeof data2 == "number") && (isFinite(data2))){
if(data2 > 9007199254740991 || isNaN(data2)){
const err11 = {instancePath:instancePath+"/maximumBufferMs",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/milliseconds/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
if(data2 < 0 || isNaN(data2)){
const err12 = {instancePath:instancePath+"/maximumBufferMs",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/milliseconds/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
}
}
else {
const err13 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
validate34.errors = vErrors;
return errors === 0;
}
validate34.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate33(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="urn:voxleaf:schema:buffer-status:v1" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate33.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.schemaVersion === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "schemaVersion"},message:"must have required property '"+"schemaVersion"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.sessionId === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sessionId"},message:"must have required property '"+"sessionId"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.generationId === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "generationId"},message:"must have required property '"+"generationId"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.contiguousPlayableDurationMs === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "contiguousPlayableDurationMs"},message:"must have required property '"+"contiguousPlayableDurationMs"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.thresholds === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "thresholds"},message:"must have required property '"+"thresholds"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.underrunCount === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "underrunCount"},message:"must have required property '"+"underrunCount"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data.state === undefined){
const err6 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "state"},message:"must have required property '"+"state"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
for(const key0 in data){
if(!(((((((key0 === "schemaVersion") || (key0 === "sessionId")) || (key0 === "generationId")) || (key0 === "contiguousPlayableDurationMs")) || (key0 === "thresholds")) || (key0 === "underrunCount")) || (key0 === "state"))){
const err7 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.schemaVersion !== undefined){
let data0 = data.schemaVersion;
if(!(((typeof data0 == "number") && (!(data0 % 1) && !isNaN(data0))) && (isFinite(data0)))){
const err8 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if((typeof data0 == "number") && (isFinite(data0))){
if(data0 > 9007199254740991 || isNaN(data0)){
const err9 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(data0 < 1 || isNaN(data0)){
const err10 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
if(1 !== data0){
const err11 = {instancePath:instancePath+"/schemaVersion",schemaPath:"#/properties/schemaVersion/allOf/1/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(data.sessionId !== undefined){
let data1 = data.sessionId;
if(typeof data1 === "string"){
if(func2(data1) > 128){
const err12 = {instancePath:instancePath+"/sessionId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/sessionId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
if(func2(data1) < 1){
const err13 = {instancePath:instancePath+"/sessionId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/sessionId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
if(!pattern4.test(data1)){
const err14 = {instancePath:instancePath+"/sessionId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/sessionId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
else {
const err15 = {instancePath:instancePath+"/sessionId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/sessionId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
if(data.generationId !== undefined){
let data2 = data.generationId;
if(typeof data2 === "string"){
if(func2(data2) > 128){
const err16 = {instancePath:instancePath+"/generationId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/generationId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
if(func2(data2) < 1){
const err17 = {instancePath:instancePath+"/generationId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/generationId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
if(!pattern4.test(data2)){
const err18 = {instancePath:instancePath+"/generationId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/generationId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
else {
const err19 = {instancePath:instancePath+"/generationId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/generationId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
if(data.contiguousPlayableDurationMs !== undefined){
let data3 = data.contiguousPlayableDurationMs;
if(!(((typeof data3 == "number") && (!(data3 % 1) && !isNaN(data3))) && (isFinite(data3)))){
const err20 = {instancePath:instancePath+"/contiguousPlayableDurationMs",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/milliseconds/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
if((typeof data3 == "number") && (isFinite(data3))){
if(data3 > 9007199254740991 || isNaN(data3)){
const err21 = {instancePath:instancePath+"/contiguousPlayableDurationMs",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/milliseconds/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
if(data3 < 0 || isNaN(data3)){
const err22 = {instancePath:instancePath+"/contiguousPlayableDurationMs",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/milliseconds/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
}
if(data.thresholds !== undefined){
if(!(validate34(data.thresholds, {instancePath:instancePath+"/thresholds",parentData:data,parentDataProperty:"thresholds",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate34.errors : vErrors.concat(validate34.errors);
errors = vErrors.length;
}
}
if(data.underrunCount !== undefined){
let data5 = data.underrunCount;
if(!(((typeof data5 == "number") && (!(data5 % 1) && !isNaN(data5))) && (isFinite(data5)))){
const err23 = {instancePath:instancePath+"/underrunCount",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/count/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
if((typeof data5 == "number") && (isFinite(data5))){
if(data5 > 9007199254740991 || isNaN(data5)){
const err24 = {instancePath:instancePath+"/underrunCount",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/count/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
if(data5 < 0 || isNaN(data5)){
const err25 = {instancePath:instancePath+"/underrunCount",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/count/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
}
if(data.state !== undefined){
let data6 = data.state;
if(typeof data6 !== "string"){
const err26 = {instancePath:instancePath+"/state",schemaPath:"#/$defs/bufferState/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
if(!(((((data6 === "empty") || (data6 === "buffering")) || (data6 === "ready")) || (data6 === "playing")) || (data6 === "paused"))){
const err27 = {instancePath:instancePath+"/state",schemaPath:"#/$defs/bufferState/enum",keyword:"enum",params:{allowedValues: schema83.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
}
else {
const err28 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
validate33.errors = vErrors;
return errors === 0;
}
validate33.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateCapabilityReportV1Wire = validate36;
const schema84 = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"urn:voxleaf:schema:capability-report:v1","title":"CapabilityReportV1Wire","description":"A model-independent report of local speech-generation features without model identity, hardware identity, or hardware-profile claims.","type":"object","additionalProperties":false,"required":["schemaVersion","capabilities"],"properties":{"schemaVersion":{"allOf":[{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion"},{"const":1}]},"capabilities":{"type":"object","additionalProperties":false,"required":["localSpeechGeneration","streamingGeneration","generationCancellation","hardwareAcceleration","cpuFallback"],"properties":{"localSpeechGeneration":{"$ref":"#/$defs/capabilityStatus"},"streamingGeneration":{"$ref":"#/$defs/capabilityStatus"},"generationCancellation":{"$ref":"#/$defs/capabilityStatus"},"hardwareAcceleration":{"$ref":"#/$defs/capabilityStatus"},"cpuFallback":{"$ref":"#/$defs/capabilityStatus"}}}},"$defs":{"capabilityStatus":{"title":"CapabilityStatusV1Wire","type":"string","enum":["supported","unsupported","unknown"],"description":"Unknown is explicit when support has not been established; it must not be treated as supported."}}};
const schema86 = {"title":"CapabilityStatusV1Wire","type":"string","enum":["supported","unsupported","unknown"],"description":"Unknown is explicit when support has not been established; it must not be treated as supported."};

function validate36(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="urn:voxleaf:schema:capability-report:v1" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate36.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.schemaVersion === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "schemaVersion"},message:"must have required property '"+"schemaVersion"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.capabilities === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "capabilities"},message:"must have required property '"+"capabilities"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
for(const key0 in data){
if(!((key0 === "schemaVersion") || (key0 === "capabilities"))){
const err2 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
if(data.schemaVersion !== undefined){
let data0 = data.schemaVersion;
if(!(((typeof data0 == "number") && (!(data0 % 1) && !isNaN(data0))) && (isFinite(data0)))){
const err3 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if((typeof data0 == "number") && (isFinite(data0))){
if(data0 > 9007199254740991 || isNaN(data0)){
const err4 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data0 < 1 || isNaN(data0)){
const err5 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(1 !== data0){
const err6 = {instancePath:instancePath+"/schemaVersion",schemaPath:"#/properties/schemaVersion/allOf/1/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data.capabilities !== undefined){
let data1 = data.capabilities;
if(data1 && typeof data1 == "object" && !Array.isArray(data1)){
if(data1.localSpeechGeneration === undefined){
const err7 = {instancePath:instancePath+"/capabilities",schemaPath:"#/properties/capabilities/required",keyword:"required",params:{missingProperty: "localSpeechGeneration"},message:"must have required property '"+"localSpeechGeneration"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(data1.streamingGeneration === undefined){
const err8 = {instancePath:instancePath+"/capabilities",schemaPath:"#/properties/capabilities/required",keyword:"required",params:{missingProperty: "streamingGeneration"},message:"must have required property '"+"streamingGeneration"+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(data1.generationCancellation === undefined){
const err9 = {instancePath:instancePath+"/capabilities",schemaPath:"#/properties/capabilities/required",keyword:"required",params:{missingProperty: "generationCancellation"},message:"must have required property '"+"generationCancellation"+"'"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(data1.hardwareAcceleration === undefined){
const err10 = {instancePath:instancePath+"/capabilities",schemaPath:"#/properties/capabilities/required",keyword:"required",params:{missingProperty: "hardwareAcceleration"},message:"must have required property '"+"hardwareAcceleration"+"'"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if(data1.cpuFallback === undefined){
const err11 = {instancePath:instancePath+"/capabilities",schemaPath:"#/properties/capabilities/required",keyword:"required",params:{missingProperty: "cpuFallback"},message:"must have required property '"+"cpuFallback"+"'"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
for(const key1 in data1){
if(!(((((key1 === "localSpeechGeneration") || (key1 === "streamingGeneration")) || (key1 === "generationCancellation")) || (key1 === "hardwareAcceleration")) || (key1 === "cpuFallback"))){
const err12 = {instancePath:instancePath+"/capabilities",schemaPath:"#/properties/capabilities/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data1.localSpeechGeneration !== undefined){
let data2 = data1.localSpeechGeneration;
if(typeof data2 !== "string"){
const err13 = {instancePath:instancePath+"/capabilities/localSpeechGeneration",schemaPath:"#/$defs/capabilityStatus/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
if(!(((data2 === "supported") || (data2 === "unsupported")) || (data2 === "unknown"))){
const err14 = {instancePath:instancePath+"/capabilities/localSpeechGeneration",schemaPath:"#/$defs/capabilityStatus/enum",keyword:"enum",params:{allowedValues: schema86.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
if(data1.streamingGeneration !== undefined){
let data3 = data1.streamingGeneration;
if(typeof data3 !== "string"){
const err15 = {instancePath:instancePath+"/capabilities/streamingGeneration",schemaPath:"#/$defs/capabilityStatus/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
if(!(((data3 === "supported") || (data3 === "unsupported")) || (data3 === "unknown"))){
const err16 = {instancePath:instancePath+"/capabilities/streamingGeneration",schemaPath:"#/$defs/capabilityStatus/enum",keyword:"enum",params:{allowedValues: schema86.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
if(data1.generationCancellation !== undefined){
let data4 = data1.generationCancellation;
if(typeof data4 !== "string"){
const err17 = {instancePath:instancePath+"/capabilities/generationCancellation",schemaPath:"#/$defs/capabilityStatus/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
if(!(((data4 === "supported") || (data4 === "unsupported")) || (data4 === "unknown"))){
const err18 = {instancePath:instancePath+"/capabilities/generationCancellation",schemaPath:"#/$defs/capabilityStatus/enum",keyword:"enum",params:{allowedValues: schema86.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
if(data1.hardwareAcceleration !== undefined){
let data5 = data1.hardwareAcceleration;
if(typeof data5 !== "string"){
const err19 = {instancePath:instancePath+"/capabilities/hardwareAcceleration",schemaPath:"#/$defs/capabilityStatus/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
if(!(((data5 === "supported") || (data5 === "unsupported")) || (data5 === "unknown"))){
const err20 = {instancePath:instancePath+"/capabilities/hardwareAcceleration",schemaPath:"#/$defs/capabilityStatus/enum",keyword:"enum",params:{allowedValues: schema86.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
if(data1.cpuFallback !== undefined){
let data6 = data1.cpuFallback;
if(typeof data6 !== "string"){
const err21 = {instancePath:instancePath+"/capabilities/cpuFallback",schemaPath:"#/$defs/capabilityStatus/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
if(!(((data6 === "supported") || (data6 === "unsupported")) || (data6 === "unknown"))){
const err22 = {instancePath:instancePath+"/capabilities/cpuFallback",schemaPath:"#/$defs/capabilityStatus/enum",keyword:"enum",params:{allowedValues: schema86.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
}
else {
const err23 = {instancePath:instancePath+"/capabilities",schemaPath:"#/properties/capabilities/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
}
else {
const err24 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
validate36.errors = vErrors;
return errors === 0;
}
validate36.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateLocatorRangeV1Wire = validate37;
const schema91 = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"urn:voxleaf:schema:locator-range:v1","title":"LocatorRangeV1Wire","description":"An ordered content-free range between two logical reading positions.","$comment":"Semantic validation requires matching book identities and nondecreasing (spineItemIndex, anchorIndex, textOffsetCodePoints) position order.","type":"object","additionalProperties":false,"required":["schemaVersion","start","end"],"properties":{"schemaVersion":{"allOf":[{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion"},{"const":1}]},"start":{"$ref":"urn:voxleaf:schema:locator:v1"},"end":{"$ref":"urn:voxleaf:schema:locator:v1"}}};
const schema93 = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"urn:voxleaf:schema:locator:v1","title":"ReadingLocatorV1Wire","description":"A content-free, layout-independent logical position within one book.","type":"object","additionalProperties":false,"required":["schemaVersion","bookIdentity","spineItemId","spineItemIndex","anchor","textOffsetCodePoints"],"properties":{"schemaVersion":{"allOf":[{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion"},{"const":1}]},"bookIdentity":{"$ref":"urn:voxleaf:schema:book:v1#/$defs/bookIdentity"},"spineItemId":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/spineItemId"},"spineItemIndex":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/index","description":"Zero-based position of the spine item in the validated book contract."},"anchor":{"$ref":"#/$defs/structuralAnchor"},"textOffsetCodePoints":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/index","description":"Zero-based Unicode code-point offset within the anchored text representation."},"progression":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/progression","description":"Optional book-level progression used only for recovery and progress display."}},"$defs":{"structuralAnchor":{"title":"StructuralAnchorV1Wire","type":"object","additionalProperties":false,"required":["kind","formatVersion","value","anchorIndex"],"properties":{"kind":{"const":"element-id"},"formatVersion":{"allOf":[{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion"},{"const":1}]},"value":{"title":"StructuralAnchorValueWire","description":"Opaque structural element identifier; never a text quotation.","type":"string","minLength":1,"maxLength":128,"pattern":"^[A-Za-z0-9_][A-Za-z0-9._:-]*$"},"anchorIndex":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/index","description":"Zero-based structural anchor order within the spine item."}}}}};
const schema46 = {"title":"ProgressionWire","type":"number","minimum":0,"maximum":1};

function validate39(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate39.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.scheme === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "scheme"},message:"must have required property '"+"scheme"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.schemeVersion === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "schemeVersion"},message:"must have required property '"+"schemeVersion"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.value === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "value"},message:"must have required property '"+"value"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
for(const key0 in data){
if(!(((key0 === "scheme") || (key0 === "schemeVersion")) || (key0 === "value"))){
const err3 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.scheme !== undefined){
let data0 = data.scheme;
if(typeof data0 === "string"){
if(func2(data0) > 64){
const err4 = {instancePath:instancePath+"/scheme",schemaPath:"#/properties/scheme/maxLength",keyword:"maxLength",params:{limit: 64},message:"must NOT have more than 64 characters"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(func2(data0) < 1){
const err5 = {instancePath:instancePath+"/scheme",schemaPath:"#/properties/scheme/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(!pattern14.test(data0)){
const err6 = {instancePath:instancePath+"/scheme",schemaPath:"#/properties/scheme/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9-]*$"},message:"must match pattern \""+"^[a-z][a-z0-9-]*$"+"\""};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
else {
const err7 = {instancePath:instancePath+"/scheme",schemaPath:"#/properties/scheme/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.schemeVersion !== undefined){
let data1 = data.schemeVersion;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err8 = {instancePath:instancePath+"/schemeVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if((typeof data1 == "number") && (isFinite(data1))){
if(data1 > 9007199254740991 || isNaN(data1)){
const err9 = {instancePath:instancePath+"/schemeVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(data1 < 1 || isNaN(data1)){
const err10 = {instancePath:instancePath+"/schemeVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
}
if(data.value !== undefined){
let data2 = data.value;
if(typeof data2 === "string"){
if(func2(data2) > 128){
const err11 = {instancePath:instancePath+"/value",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/bookId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
if(func2(data2) < 1){
const err12 = {instancePath:instancePath+"/value",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/bookId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
if(!pattern4.test(data2)){
const err13 = {instancePath:instancePath+"/value",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/bookId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
else {
const err14 = {instancePath:instancePath+"/value",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/bookId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
if(typeof data2 === "string"){
if(func2(data2) > 512){
const err15 = {instancePath:instancePath+"/value",schemaPath:"#/properties/value/maxLength",keyword:"maxLength",params:{limit: 512},message:"must NOT have more than 512 characters"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
if(!pattern16.test(data2)){
const err16 = {instancePath:instancePath+"/value",schemaPath:"#/properties/value/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z0-9._~-]+$"},message:"must match pattern \""+"^[A-Za-z0-9._~-]+$"+"\""};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
else {
const err17 = {instancePath:instancePath+"/value",schemaPath:"#/properties/value/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
}
else {
const err18 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
validate39.errors = vErrors;
return errors === 0;
}
validate39.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema100 = {"title":"StructuralAnchorV1Wire","type":"object","additionalProperties":false,"required":["kind","formatVersion","value","anchorIndex"],"properties":{"kind":{"const":"element-id"},"formatVersion":{"allOf":[{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion"},{"const":1}]},"value":{"title":"StructuralAnchorValueWire","description":"Opaque structural element identifier; never a text quotation.","type":"string","minLength":1,"maxLength":128,"pattern":"^[A-Za-z0-9_][A-Za-z0-9._:-]*$"},"anchorIndex":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/index","description":"Zero-based structural anchor order within the spine item."}}};
const pattern31 = new RegExp("^[A-Za-z0-9_][A-Za-z0-9._:-]*$", "u");

function validate41(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate41.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.kind === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "kind"},message:"must have required property '"+"kind"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.formatVersion === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "formatVersion"},message:"must have required property '"+"formatVersion"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.value === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "value"},message:"must have required property '"+"value"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.anchorIndex === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "anchorIndex"},message:"must have required property '"+"anchorIndex"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
for(const key0 in data){
if(!((((key0 === "kind") || (key0 === "formatVersion")) || (key0 === "value")) || (key0 === "anchorIndex"))){
const err4 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.kind !== undefined){
if("element-id" !== data.kind){
const err5 = {instancePath:instancePath+"/kind",schemaPath:"#/properties/kind/const",keyword:"const",params:{allowedValue: "element-id"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.formatVersion !== undefined){
let data1 = data.formatVersion;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err6 = {instancePath:instancePath+"/formatVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if((typeof data1 == "number") && (isFinite(data1))){
if(data1 > 9007199254740991 || isNaN(data1)){
const err7 = {instancePath:instancePath+"/formatVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(data1 < 1 || isNaN(data1)){
const err8 = {instancePath:instancePath+"/formatVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(1 !== data1){
const err9 = {instancePath:instancePath+"/formatVersion",schemaPath:"#/properties/formatVersion/allOf/1/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
if(data.value !== undefined){
let data2 = data.value;
if(typeof data2 === "string"){
if(func2(data2) > 128){
const err10 = {instancePath:instancePath+"/value",schemaPath:"#/properties/value/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if(func2(data2) < 1){
const err11 = {instancePath:instancePath+"/value",schemaPath:"#/properties/value/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
if(!pattern31.test(data2)){
const err12 = {instancePath:instancePath+"/value",schemaPath:"#/properties/value/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z0-9_][A-Za-z0-9._:-]*$"},message:"must match pattern \""+"^[A-Za-z0-9_][A-Za-z0-9._:-]*$"+"\""};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
else {
const err13 = {instancePath:instancePath+"/value",schemaPath:"#/properties/value/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
if(data.anchorIndex !== undefined){
let data3 = data.anchorIndex;
if(!(((typeof data3 == "number") && (!(data3 % 1) && !isNaN(data3))) && (isFinite(data3)))){
const err14 = {instancePath:instancePath+"/anchorIndex",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/index/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
if((typeof data3 == "number") && (isFinite(data3))){
if(data3 > 9007199254740991 || isNaN(data3)){
const err15 = {instancePath:instancePath+"/anchorIndex",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/index/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
if(data3 < 0 || isNaN(data3)){
const err16 = {instancePath:instancePath+"/anchorIndex",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/index/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
}
}
else {
const err17 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
validate41.errors = vErrors;
return errors === 0;
}
validate41.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate38(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="urn:voxleaf:schema:locator:v1" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate38.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.schemaVersion === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "schemaVersion"},message:"must have required property '"+"schemaVersion"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.bookIdentity === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "bookIdentity"},message:"must have required property '"+"bookIdentity"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.spineItemId === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "spineItemId"},message:"must have required property '"+"spineItemId"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.spineItemIndex === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "spineItemIndex"},message:"must have required property '"+"spineItemIndex"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.anchor === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "anchor"},message:"must have required property '"+"anchor"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.textOffsetCodePoints === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "textOffsetCodePoints"},message:"must have required property '"+"textOffsetCodePoints"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
for(const key0 in data){
if(!(((((((key0 === "schemaVersion") || (key0 === "bookIdentity")) || (key0 === "spineItemId")) || (key0 === "spineItemIndex")) || (key0 === "anchor")) || (key0 === "textOffsetCodePoints")) || (key0 === "progression"))){
const err6 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data.schemaVersion !== undefined){
let data0 = data.schemaVersion;
if(!(((typeof data0 == "number") && (!(data0 % 1) && !isNaN(data0))) && (isFinite(data0)))){
const err7 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if((typeof data0 == "number") && (isFinite(data0))){
if(data0 > 9007199254740991 || isNaN(data0)){
const err8 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(data0 < 1 || isNaN(data0)){
const err9 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
if(1 !== data0){
const err10 = {instancePath:instancePath+"/schemaVersion",schemaPath:"#/properties/schemaVersion/allOf/1/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
if(data.bookIdentity !== undefined){
if(!(validate39(data.bookIdentity, {instancePath:instancePath+"/bookIdentity",parentData:data,parentDataProperty:"bookIdentity",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate39.errors : vErrors.concat(validate39.errors);
errors = vErrors.length;
}
}
if(data.spineItemId !== undefined){
let data2 = data.spineItemId;
if(typeof data2 === "string"){
if(func2(data2) > 128){
const err11 = {instancePath:instancePath+"/spineItemId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/spineItemId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
if(func2(data2) < 1){
const err12 = {instancePath:instancePath+"/spineItemId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/spineItemId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
if(!pattern4.test(data2)){
const err13 = {instancePath:instancePath+"/spineItemId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/spineItemId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
else {
const err14 = {instancePath:instancePath+"/spineItemId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/spineItemId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
if(data.spineItemIndex !== undefined){
let data3 = data.spineItemIndex;
if(!(((typeof data3 == "number") && (!(data3 % 1) && !isNaN(data3))) && (isFinite(data3)))){
const err15 = {instancePath:instancePath+"/spineItemIndex",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/index/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
if((typeof data3 == "number") && (isFinite(data3))){
if(data3 > 9007199254740991 || isNaN(data3)){
const err16 = {instancePath:instancePath+"/spineItemIndex",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/index/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
if(data3 < 0 || isNaN(data3)){
const err17 = {instancePath:instancePath+"/spineItemIndex",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/index/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
}
if(data.anchor !== undefined){
if(!(validate41(data.anchor, {instancePath:instancePath+"/anchor",parentData:data,parentDataProperty:"anchor",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate41.errors : vErrors.concat(validate41.errors);
errors = vErrors.length;
}
}
if(data.textOffsetCodePoints !== undefined){
let data5 = data.textOffsetCodePoints;
if(!(((typeof data5 == "number") && (!(data5 % 1) && !isNaN(data5))) && (isFinite(data5)))){
const err18 = {instancePath:instancePath+"/textOffsetCodePoints",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/index/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
if((typeof data5 == "number") && (isFinite(data5))){
if(data5 > 9007199254740991 || isNaN(data5)){
const err19 = {instancePath:instancePath+"/textOffsetCodePoints",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/index/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
if(data5 < 0 || isNaN(data5)){
const err20 = {instancePath:instancePath+"/textOffsetCodePoints",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/index/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
}
if(data.progression !== undefined){
let data6 = data.progression;
if((typeof data6 == "number") && (isFinite(data6))){
if(data6 > 1 || isNaN(data6)){
const err21 = {instancePath:instancePath+"/progression",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/progression/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1},message:"must be <= 1"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
if(data6 < 0 || isNaN(data6)){
const err22 = {instancePath:instancePath+"/progression",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/progression/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
else {
const err23 = {instancePath:instancePath+"/progression",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/progression/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
}
else {
const err24 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
validate38.errors = vErrors;
return errors === 0;
}
validate38.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate37(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="urn:voxleaf:schema:locator-range:v1" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate37.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.schemaVersion === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "schemaVersion"},message:"must have required property '"+"schemaVersion"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.start === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "start"},message:"must have required property '"+"start"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.end === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "end"},message:"must have required property '"+"end"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
for(const key0 in data){
if(!(((key0 === "schemaVersion") || (key0 === "start")) || (key0 === "end"))){
const err3 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.schemaVersion !== undefined){
let data0 = data.schemaVersion;
if(!(((typeof data0 == "number") && (!(data0 % 1) && !isNaN(data0))) && (isFinite(data0)))){
const err4 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if((typeof data0 == "number") && (isFinite(data0))){
if(data0 > 9007199254740991 || isNaN(data0)){
const err5 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data0 < 1 || isNaN(data0)){
const err6 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(1 !== data0){
const err7 = {instancePath:instancePath+"/schemaVersion",schemaPath:"#/properties/schemaVersion/allOf/1/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.start !== undefined){
if(!(validate38(data.start, {instancePath:instancePath+"/start",parentData:data,parentDataProperty:"start",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate38.errors : vErrors.concat(validate38.errors);
errors = vErrors.length;
}
}
if(data.end !== undefined){
if(!(validate38(data.end, {instancePath:instancePath+"/end",parentData:data,parentDataProperty:"end",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate38.errors : vErrors.concat(validate38.errors);
errors = vErrors.length;
}
}
}
else {
const err8 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
validate37.errors = vErrors;
return errors === 0;
}
validate37.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateReadingLocatorV1Wire = validate38;

export const validateNarrationSegmentV1Wire = validate45;
const schema105 = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"urn:voxleaf:schema:narration-segment:v1","title":"NarrationSegmentV1Wire","description":"One sensitive narration payload tied to a stable reading range and asynchronous work identity.","type":"object","additionalProperties":false,"required":["schemaVersion","segmentId","bookIdentity","sessionId","generationId","sequence","sourceRange","text"],"properties":{"schemaVersion":{"allOf":[{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion"},{"const":1}]},"segmentId":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/segmentId"},"bookIdentity":{"$ref":"urn:voxleaf:schema:book:v1#/$defs/bookIdentity"},"sessionId":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/sessionId"},"generationId":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/generationId"},"sequence":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/index","description":"Zero-based order within the active generation; segment production rules remain external."},"sourceRange":{"$ref":"urn:voxleaf:schema:locator-range:v1","description":"The ordered logical reading range that supplied this narration text."},"text":{"type":"string","minLength":1,"description":"Sensitive narration text. It must not be copied into errors, metrics, persisted reading state, or debug snapshots."}}};

function validate46(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate46.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.scheme === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "scheme"},message:"must have required property '"+"scheme"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.schemeVersion === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "schemeVersion"},message:"must have required property '"+"schemeVersion"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.value === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "value"},message:"must have required property '"+"value"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
for(const key0 in data){
if(!(((key0 === "scheme") || (key0 === "schemeVersion")) || (key0 === "value"))){
const err3 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.scheme !== undefined){
let data0 = data.scheme;
if(typeof data0 === "string"){
if(func2(data0) > 64){
const err4 = {instancePath:instancePath+"/scheme",schemaPath:"#/properties/scheme/maxLength",keyword:"maxLength",params:{limit: 64},message:"must NOT have more than 64 characters"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(func2(data0) < 1){
const err5 = {instancePath:instancePath+"/scheme",schemaPath:"#/properties/scheme/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(!pattern14.test(data0)){
const err6 = {instancePath:instancePath+"/scheme",schemaPath:"#/properties/scheme/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9-]*$"},message:"must match pattern \""+"^[a-z][a-z0-9-]*$"+"\""};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
else {
const err7 = {instancePath:instancePath+"/scheme",schemaPath:"#/properties/scheme/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.schemeVersion !== undefined){
let data1 = data.schemeVersion;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err8 = {instancePath:instancePath+"/schemeVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if((typeof data1 == "number") && (isFinite(data1))){
if(data1 > 9007199254740991 || isNaN(data1)){
const err9 = {instancePath:instancePath+"/schemeVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(data1 < 1 || isNaN(data1)){
const err10 = {instancePath:instancePath+"/schemeVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
}
if(data.value !== undefined){
let data2 = data.value;
if(typeof data2 === "string"){
if(func2(data2) > 128){
const err11 = {instancePath:instancePath+"/value",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/bookId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
if(func2(data2) < 1){
const err12 = {instancePath:instancePath+"/value",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/bookId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
if(!pattern4.test(data2)){
const err13 = {instancePath:instancePath+"/value",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/bookId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
else {
const err14 = {instancePath:instancePath+"/value",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/bookId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
if(typeof data2 === "string"){
if(func2(data2) > 512){
const err15 = {instancePath:instancePath+"/value",schemaPath:"#/properties/value/maxLength",keyword:"maxLength",params:{limit: 512},message:"must NOT have more than 512 characters"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
if(!pattern16.test(data2)){
const err16 = {instancePath:instancePath+"/value",schemaPath:"#/properties/value/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z0-9._~-]+$"},message:"must match pattern \""+"^[A-Za-z0-9._~-]+$"+"\""};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
else {
const err17 = {instancePath:instancePath+"/value",schemaPath:"#/properties/value/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
}
else {
const err18 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
validate46.errors = vErrors;
return errors === 0;
}
validate46.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate45(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="urn:voxleaf:schema:narration-segment:v1" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate45.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.schemaVersion === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "schemaVersion"},message:"must have required property '"+"schemaVersion"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.segmentId === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "segmentId"},message:"must have required property '"+"segmentId"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.bookIdentity === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "bookIdentity"},message:"must have required property '"+"bookIdentity"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.sessionId === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sessionId"},message:"must have required property '"+"sessionId"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.generationId === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "generationId"},message:"must have required property '"+"generationId"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.sequence === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sequence"},message:"must have required property '"+"sequence"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data.sourceRange === undefined){
const err6 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sourceRange"},message:"must have required property '"+"sourceRange"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(data.text === undefined){
const err7 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "text"},message:"must have required property '"+"text"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
for(const key0 in data){
if(!((((((((key0 === "schemaVersion") || (key0 === "segmentId")) || (key0 === "bookIdentity")) || (key0 === "sessionId")) || (key0 === "generationId")) || (key0 === "sequence")) || (key0 === "sourceRange")) || (key0 === "text"))){
const err8 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data.schemaVersion !== undefined){
let data0 = data.schemaVersion;
if(!(((typeof data0 == "number") && (!(data0 % 1) && !isNaN(data0))) && (isFinite(data0)))){
const err9 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if((typeof data0 == "number") && (isFinite(data0))){
if(data0 > 9007199254740991 || isNaN(data0)){
const err10 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if(data0 < 1 || isNaN(data0)){
const err11 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(1 !== data0){
const err12 = {instancePath:instancePath+"/schemaVersion",schemaPath:"#/properties/schemaVersion/allOf/1/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data.segmentId !== undefined){
let data1 = data.segmentId;
if(typeof data1 === "string"){
if(func2(data1) > 128){
const err13 = {instancePath:instancePath+"/segmentId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/segmentId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
if(func2(data1) < 1){
const err14 = {instancePath:instancePath+"/segmentId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/segmentId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
if(!pattern4.test(data1)){
const err15 = {instancePath:instancePath+"/segmentId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/segmentId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
else {
const err16 = {instancePath:instancePath+"/segmentId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/segmentId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
if(data.bookIdentity !== undefined){
if(!(validate46(data.bookIdentity, {instancePath:instancePath+"/bookIdentity",parentData:data,parentDataProperty:"bookIdentity",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
errors = vErrors.length;
}
}
if(data.sessionId !== undefined){
let data3 = data.sessionId;
if(typeof data3 === "string"){
if(func2(data3) > 128){
const err17 = {instancePath:instancePath+"/sessionId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/sessionId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
if(func2(data3) < 1){
const err18 = {instancePath:instancePath+"/sessionId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/sessionId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
if(!pattern4.test(data3)){
const err19 = {instancePath:instancePath+"/sessionId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/sessionId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
else {
const err20 = {instancePath:instancePath+"/sessionId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/sessionId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
if(data.generationId !== undefined){
let data4 = data.generationId;
if(typeof data4 === "string"){
if(func2(data4) > 128){
const err21 = {instancePath:instancePath+"/generationId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/generationId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
if(func2(data4) < 1){
const err22 = {instancePath:instancePath+"/generationId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/generationId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
if(!pattern4.test(data4)){
const err23 = {instancePath:instancePath+"/generationId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/generationId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
else {
const err24 = {instancePath:instancePath+"/generationId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/generationId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
if(data.sequence !== undefined){
let data5 = data.sequence;
if(!(((typeof data5 == "number") && (!(data5 % 1) && !isNaN(data5))) && (isFinite(data5)))){
const err25 = {instancePath:instancePath+"/sequence",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/index/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
if((typeof data5 == "number") && (isFinite(data5))){
if(data5 > 9007199254740991 || isNaN(data5)){
const err26 = {instancePath:instancePath+"/sequence",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/index/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
if(data5 < 0 || isNaN(data5)){
const err27 = {instancePath:instancePath+"/sequence",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/index/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
}
if(data.sourceRange !== undefined){
if(!(validate37(data.sourceRange, {instancePath:instancePath+"/sourceRange",parentData:data,parentDataProperty:"sourceRange",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate37.errors : vErrors.concat(validate37.errors);
errors = vErrors.length;
}
}
if(data.text !== undefined){
let data7 = data.text;
if(typeof data7 === "string"){
if(func2(data7) < 1){
const err28 = {instancePath:instancePath+"/text",schemaPath:"#/properties/text/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
else {
const err29 = {instancePath:instancePath+"/text",schemaPath:"#/properties/text/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
}
}
else {
const err30 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
validate45.errors = vErrors;
return errors === 0;
}
validate45.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateOperationalErrorV1Wire = validate49;
const schema114 = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"urn:voxleaf:schema:operational-error:v1","title":"OperationalErrorV1Wire","description":"A privacy-safe machine-readable failure without content, paths, stack traces, or implementation details.","type":"object","additionalProperties":false,"required":["schemaVersion","code","category","severity"],"properties":{"schemaVersion":{"allOf":[{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion"},{"const":1}]},"code":{"type":"string","enum":["invalid-input","unsupported-input","capability-unavailable","operation-cancelled","resource-exhausted","internal-failure"],"description":"Stable machine-readable error code. Presentation layers map it to safe localized text."},"category":{"type":"string","enum":["input","availability","cancellation","resource","internal"]},"severity":{"type":"string","enum":["recoverable","fatal"],"description":"Whether the owning workflow can offer a safe recovery path or must stop."}}};

function validate49(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="urn:voxleaf:schema:operational-error:v1" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate49.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.schemaVersion === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "schemaVersion"},message:"must have required property '"+"schemaVersion"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.code === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "code"},message:"must have required property '"+"code"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.category === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "category"},message:"must have required property '"+"category"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.severity === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "severity"},message:"must have required property '"+"severity"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
for(const key0 in data){
if(!((((key0 === "schemaVersion") || (key0 === "code")) || (key0 === "category")) || (key0 === "severity"))){
const err4 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.schemaVersion !== undefined){
let data0 = data.schemaVersion;
if(!(((typeof data0 == "number") && (!(data0 % 1) && !isNaN(data0))) && (isFinite(data0)))){
const err5 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if((typeof data0 == "number") && (isFinite(data0))){
if(data0 > 9007199254740991 || isNaN(data0)){
const err6 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(data0 < 1 || isNaN(data0)){
const err7 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(1 !== data0){
const err8 = {instancePath:instancePath+"/schemaVersion",schemaPath:"#/properties/schemaVersion/allOf/1/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data.code !== undefined){
let data1 = data.code;
if(typeof data1 !== "string"){
const err9 = {instancePath:instancePath+"/code",schemaPath:"#/properties/code/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(!((((((data1 === "invalid-input") || (data1 === "unsupported-input")) || (data1 === "capability-unavailable")) || (data1 === "operation-cancelled")) || (data1 === "resource-exhausted")) || (data1 === "internal-failure"))){
const err10 = {instancePath:instancePath+"/code",schemaPath:"#/properties/code/enum",keyword:"enum",params:{allowedValues: schema114.properties.code.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
if(data.category !== undefined){
let data2 = data.category;
if(typeof data2 !== "string"){
const err11 = {instancePath:instancePath+"/category",schemaPath:"#/properties/category/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
if(!(((((data2 === "input") || (data2 === "availability")) || (data2 === "cancellation")) || (data2 === "resource")) || (data2 === "internal"))){
const err12 = {instancePath:instancePath+"/category",schemaPath:"#/properties/category/enum",keyword:"enum",params:{allowedValues: schema114.properties.category.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data.severity !== undefined){
let data3 = data.severity;
if(typeof data3 !== "string"){
const err13 = {instancePath:instancePath+"/severity",schemaPath:"#/properties/severity/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
if(!((data3 === "recoverable") || (data3 === "fatal"))){
const err14 = {instancePath:instancePath+"/severity",schemaPath:"#/properties/severity/enum",keyword:"enum",params:{allowedValues: schema114.properties.severity.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
}
else {
const err15 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
validate49.errors = vErrors;
return errors === 0;
}
validate49.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validatePersistedReadingStateV1Wire = validate50;
const schema116 = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"urn:voxleaf:schema:persisted-reading-state:v1","title":"PersistedReadingStateV1Wire","description":"Content-free local reading state for one book without choosing a storage implementation.","type":"object","additionalProperties":false,"required":["schemaVersion","bookIdentity","locator","preferences"],"properties":{"schemaVersion":{"allOf":[{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion"},{"const":1}]},"bookIdentity":{"$ref":"urn:voxleaf:schema:book:v1#/$defs/bookIdentity"},"locator":{"$ref":"urn:voxleaf:schema:locator:v1","description":"The authoritative layout-independent reading position."},"preferences":{"$ref":"#/$defs/readingPreferences"}},"$defs":{"preferenceIdentifier":{"type":"string","minLength":1,"maxLength":128,"pattern":"^[A-Za-z0-9][A-Za-z0-9._:-]*$"},"readingPreferences":{"title":"PersistedReadingPreferencesV1Wire","description":"Minimal preferences already defined by product requirements; capability support is validated by later application layers.","type":"object","additionalProperties":false,"properties":{"selectedVoiceId":{"$ref":"#/$defs/preferenceIdentifier","description":"Opaque local voice identifier; never a filesystem path."},"playbackRate":{"type":"number","exclusiveMinimum":0,"description":"Positive requested playback-rate multiplier; later capability contracts determine supported values."}}}}};

function validate51(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate51.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.scheme === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "scheme"},message:"must have required property '"+"scheme"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.schemeVersion === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "schemeVersion"},message:"must have required property '"+"schemeVersion"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.value === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "value"},message:"must have required property '"+"value"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
for(const key0 in data){
if(!(((key0 === "scheme") || (key0 === "schemeVersion")) || (key0 === "value"))){
const err3 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.scheme !== undefined){
let data0 = data.scheme;
if(typeof data0 === "string"){
if(func2(data0) > 64){
const err4 = {instancePath:instancePath+"/scheme",schemaPath:"#/properties/scheme/maxLength",keyword:"maxLength",params:{limit: 64},message:"must NOT have more than 64 characters"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(func2(data0) < 1){
const err5 = {instancePath:instancePath+"/scheme",schemaPath:"#/properties/scheme/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(!pattern14.test(data0)){
const err6 = {instancePath:instancePath+"/scheme",schemaPath:"#/properties/scheme/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9-]*$"},message:"must match pattern \""+"^[a-z][a-z0-9-]*$"+"\""};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
else {
const err7 = {instancePath:instancePath+"/scheme",schemaPath:"#/properties/scheme/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.schemeVersion !== undefined){
let data1 = data.schemeVersion;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err8 = {instancePath:instancePath+"/schemeVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if((typeof data1 == "number") && (isFinite(data1))){
if(data1 > 9007199254740991 || isNaN(data1)){
const err9 = {instancePath:instancePath+"/schemeVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(data1 < 1 || isNaN(data1)){
const err10 = {instancePath:instancePath+"/schemeVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
}
if(data.value !== undefined){
let data2 = data.value;
if(typeof data2 === "string"){
if(func2(data2) > 128){
const err11 = {instancePath:instancePath+"/value",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/bookId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
if(func2(data2) < 1){
const err12 = {instancePath:instancePath+"/value",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/bookId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
if(!pattern4.test(data2)){
const err13 = {instancePath:instancePath+"/value",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/bookId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
else {
const err14 = {instancePath:instancePath+"/value",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/bookId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
if(typeof data2 === "string"){
if(func2(data2) > 512){
const err15 = {instancePath:instancePath+"/value",schemaPath:"#/properties/value/maxLength",keyword:"maxLength",params:{limit: 512},message:"must NOT have more than 512 characters"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
if(!pattern16.test(data2)){
const err16 = {instancePath:instancePath+"/value",schemaPath:"#/properties/value/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z0-9._~-]+$"},message:"must match pattern \""+"^[A-Za-z0-9._~-]+$"+"\""};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
else {
const err17 = {instancePath:instancePath+"/value",schemaPath:"#/properties/value/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
}
else {
const err18 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
validate51.errors = vErrors;
return errors === 0;
}
validate51.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema121 = {"title":"PersistedReadingPreferencesV1Wire","description":"Minimal preferences already defined by product requirements; capability support is validated by later application layers.","type":"object","additionalProperties":false,"properties":{"selectedVoiceId":{"$ref":"#/$defs/preferenceIdentifier","description":"Opaque local voice identifier; never a filesystem path."},"playbackRate":{"type":"number","exclusiveMinimum":0,"description":"Positive requested playback-rate multiplier; later capability contracts determine supported values."}}};
const schema122 = {"type":"string","minLength":1,"maxLength":128,"pattern":"^[A-Za-z0-9][A-Za-z0-9._:-]*$"};
const pattern41 = new RegExp("^[A-Za-z0-9][A-Za-z0-9._:-]*$", "u");

function validate54(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate54.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
for(const key0 in data){
if(!((key0 === "selectedVoiceId") || (key0 === "playbackRate"))){
const err0 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
}
if(data.selectedVoiceId !== undefined){
let data0 = data.selectedVoiceId;
if(typeof data0 === "string"){
if(func2(data0) > 128){
const err1 = {instancePath:instancePath+"/selectedVoiceId",schemaPath:"#/$defs/preferenceIdentifier/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(func2(data0) < 1){
const err2 = {instancePath:instancePath+"/selectedVoiceId",schemaPath:"#/$defs/preferenceIdentifier/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(!pattern41.test(data0)){
const err3 = {instancePath:instancePath+"/selectedVoiceId",schemaPath:"#/$defs/preferenceIdentifier/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z0-9][A-Za-z0-9._:-]*$"},message:"must match pattern \""+"^[A-Za-z0-9][A-Za-z0-9._:-]*$"+"\""};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
else {
const err4 = {instancePath:instancePath+"/selectedVoiceId",schemaPath:"#/$defs/preferenceIdentifier/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.playbackRate !== undefined){
let data1 = data.playbackRate;
if((typeof data1 == "number") && (isFinite(data1))){
if(data1 <= 0 || isNaN(data1)){
const err5 = {instancePath:instancePath+"/playbackRate",schemaPath:"#/properties/playbackRate/exclusiveMinimum",keyword:"exclusiveMinimum",params:{comparison: ">", limit: 0},message:"must be > 0"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
else {
const err6 = {instancePath:instancePath+"/playbackRate",schemaPath:"#/properties/playbackRate/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
}
else {
const err7 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
validate54.errors = vErrors;
return errors === 0;
}
validate54.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate50(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="urn:voxleaf:schema:persisted-reading-state:v1" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate50.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.schemaVersion === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "schemaVersion"},message:"must have required property '"+"schemaVersion"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.bookIdentity === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "bookIdentity"},message:"must have required property '"+"bookIdentity"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.locator === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "locator"},message:"must have required property '"+"locator"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.preferences === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "preferences"},message:"must have required property '"+"preferences"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
for(const key0 in data){
if(!((((key0 === "schemaVersion") || (key0 === "bookIdentity")) || (key0 === "locator")) || (key0 === "preferences"))){
const err4 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.schemaVersion !== undefined){
let data0 = data.schemaVersion;
if(!(((typeof data0 == "number") && (!(data0 % 1) && !isNaN(data0))) && (isFinite(data0)))){
const err5 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if((typeof data0 == "number") && (isFinite(data0))){
if(data0 > 9007199254740991 || isNaN(data0)){
const err6 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(data0 < 1 || isNaN(data0)){
const err7 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(1 !== data0){
const err8 = {instancePath:instancePath+"/schemaVersion",schemaPath:"#/properties/schemaVersion/allOf/1/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data.bookIdentity !== undefined){
if(!(validate51(data.bookIdentity, {instancePath:instancePath+"/bookIdentity",parentData:data,parentDataProperty:"bookIdentity",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate51.errors : vErrors.concat(validate51.errors);
errors = vErrors.length;
}
}
if(data.locator !== undefined){
if(!(validate38(data.locator, {instancePath:instancePath+"/locator",parentData:data,parentDataProperty:"locator",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate38.errors : vErrors.concat(validate38.errors);
errors = vErrors.length;
}
}
if(data.preferences !== undefined){
if(!(validate54(data.preferences, {instancePath:instancePath+"/preferences",parentData:data,parentDataProperty:"preferences",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
errors = vErrors.length;
}
}
}
else {
const err9 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
validate50.errors = vErrors;
return errors === 0;
}
validate50.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateReadingSessionV1Wire = validate56;
const schema123 = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"urn:voxleaf:schema:reading-session:v1","title":"ReadingSessionV1Wire","description":"The active book-reading session and generation used to reject stale asynchronous work.","type":"object","additionalProperties":false,"required":["schemaVersion","sessionId","bookIdentity","generationId"],"properties":{"schemaVersion":{"allOf":[{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion"},{"const":1}]},"sessionId":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/sessionId"},"bookIdentity":{"$ref":"urn:voxleaf:schema:book:v1#/$defs/bookIdentity"},"generationId":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/generationId","description":"The currently active generation within this session."}}};

function validate57(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate57.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.scheme === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "scheme"},message:"must have required property '"+"scheme"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.schemeVersion === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "schemeVersion"},message:"must have required property '"+"schemeVersion"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.value === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "value"},message:"must have required property '"+"value"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
for(const key0 in data){
if(!(((key0 === "scheme") || (key0 === "schemeVersion")) || (key0 === "value"))){
const err3 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.scheme !== undefined){
let data0 = data.scheme;
if(typeof data0 === "string"){
if(func2(data0) > 64){
const err4 = {instancePath:instancePath+"/scheme",schemaPath:"#/properties/scheme/maxLength",keyword:"maxLength",params:{limit: 64},message:"must NOT have more than 64 characters"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(func2(data0) < 1){
const err5 = {instancePath:instancePath+"/scheme",schemaPath:"#/properties/scheme/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(!pattern14.test(data0)){
const err6 = {instancePath:instancePath+"/scheme",schemaPath:"#/properties/scheme/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9-]*$"},message:"must match pattern \""+"^[a-z][a-z0-9-]*$"+"\""};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
else {
const err7 = {instancePath:instancePath+"/scheme",schemaPath:"#/properties/scheme/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.schemeVersion !== undefined){
let data1 = data.schemeVersion;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err8 = {instancePath:instancePath+"/schemeVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if((typeof data1 == "number") && (isFinite(data1))){
if(data1 > 9007199254740991 || isNaN(data1)){
const err9 = {instancePath:instancePath+"/schemeVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(data1 < 1 || isNaN(data1)){
const err10 = {instancePath:instancePath+"/schemeVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
}
if(data.value !== undefined){
let data2 = data.value;
if(typeof data2 === "string"){
if(func2(data2) > 128){
const err11 = {instancePath:instancePath+"/value",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/bookId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
if(func2(data2) < 1){
const err12 = {instancePath:instancePath+"/value",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/bookId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
if(!pattern4.test(data2)){
const err13 = {instancePath:instancePath+"/value",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/bookId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
else {
const err14 = {instancePath:instancePath+"/value",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/bookId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
if(typeof data2 === "string"){
if(func2(data2) > 512){
const err15 = {instancePath:instancePath+"/value",schemaPath:"#/properties/value/maxLength",keyword:"maxLength",params:{limit: 512},message:"must NOT have more than 512 characters"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
if(!pattern16.test(data2)){
const err16 = {instancePath:instancePath+"/value",schemaPath:"#/properties/value/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z0-9._~-]+$"},message:"must match pattern \""+"^[A-Za-z0-9._~-]+$"+"\""};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
else {
const err17 = {instancePath:instancePath+"/value",schemaPath:"#/properties/value/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
}
else {
const err18 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
validate57.errors = vErrors;
return errors === 0;
}
validate57.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate56(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="urn:voxleaf:schema:reading-session:v1" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate56.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.schemaVersion === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "schemaVersion"},message:"must have required property '"+"schemaVersion"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.sessionId === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sessionId"},message:"must have required property '"+"sessionId"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.bookIdentity === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "bookIdentity"},message:"must have required property '"+"bookIdentity"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.generationId === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "generationId"},message:"must have required property '"+"generationId"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
for(const key0 in data){
if(!((((key0 === "schemaVersion") || (key0 === "sessionId")) || (key0 === "bookIdentity")) || (key0 === "generationId"))){
const err4 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.schemaVersion !== undefined){
let data0 = data.schemaVersion;
if(!(((typeof data0 == "number") && (!(data0 % 1) && !isNaN(data0))) && (isFinite(data0)))){
const err5 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if((typeof data0 == "number") && (isFinite(data0))){
if(data0 > 9007199254740991 || isNaN(data0)){
const err6 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(data0 < 1 || isNaN(data0)){
const err7 = {instancePath:instancePath+"/schemaVersion",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(1 !== data0){
const err8 = {instancePath:instancePath+"/schemaVersion",schemaPath:"#/properties/schemaVersion/allOf/1/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data.sessionId !== undefined){
let data1 = data.sessionId;
if(typeof data1 === "string"){
if(func2(data1) > 128){
const err9 = {instancePath:instancePath+"/sessionId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/sessionId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(func2(data1) < 1){
const err10 = {instancePath:instancePath+"/sessionId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/sessionId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if(!pattern4.test(data1)){
const err11 = {instancePath:instancePath+"/sessionId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/sessionId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
else {
const err12 = {instancePath:instancePath+"/sessionId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/sessionId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data.bookIdentity !== undefined){
if(!(validate57(data.bookIdentity, {instancePath:instancePath+"/bookIdentity",parentData:data,parentDataProperty:"bookIdentity",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate57.errors : vErrors.concat(validate57.errors);
errors = vErrors.length;
}
}
if(data.generationId !== undefined){
let data3 = data.generationId;
if(typeof data3 === "string"){
if(func2(data3) > 128){
const err13 = {instancePath:instancePath+"/generationId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/generationId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
if(func2(data3) < 1){
const err14 = {instancePath:instancePath+"/generationId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/generationId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
if(!pattern4.test(data3)){
const err15 = {instancePath:instancePath+"/generationId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/generationId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
else {
const err16 = {instancePath:instancePath+"/generationId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/generationId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
}
else {
const err17 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
validate56.errors = vErrors;
return errors === 0;
}
validate56.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};
