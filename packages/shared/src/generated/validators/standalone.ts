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

export const validateHostProfileCompatibilityReportV1Wire = validate37;
const schema91 = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"urn:voxleaf:schema:host-profile-compatibility-report:v1","title":"HostProfileCompatibilityReportV1Wire","description":"A bounded privacy-safe snapshot of local host facts needed for conservative TTS profile matching. It contains no host identity, raw platform output, path, recommendation, or support claim.","type":"object","additionalProperties":false,"required":["schemaVersion","probeStatus","platform","processor","memory","storage","providers"],"properties":{"schemaVersion":{"allOf":[{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion"},{"const":1}]},"probeStatus":{"type":"string","enum":["complete","partial","permission-denied","unavailable"]},"platform":{"type":"object","additionalProperties":false,"required":["operatingSystem","architecture"],"properties":{"operatingSystem":{"type":"string","enum":["windows","linux","macos","other","unknown"]},"architecture":{"type":"string","enum":["x86_64","aarch64","other","unknown"]}}},"processor":{"type":"object","additionalProperties":false,"required":["logicalProcessorCount"],"properties":{"logicalProcessorCount":{"$ref":"#/$defs/knownLogicalProcessorCount"}}},"memory":{"type":"object","additionalProperties":false,"required":["totalPhysicalMiB","availablePhysicalMiB"],"properties":{"totalPhysicalMiB":{"$ref":"#/$defs/knownPositiveMebibytes"},"availablePhysicalMiB":{"$ref":"#/$defs/knownNonNegativeMebibytes"}}},"storage":{"type":"object","additionalProperties":false,"required":["applicationVolumeAvailableMiB"],"properties":{"applicationVolumeAvailableMiB":{"$ref":"#/$defs/knownNonNegativeMebibytes"}}},"providers":{"type":"object","additionalProperties":false,"required":["cpu","cuda","directml","rocm","metal"],"properties":{"cpu":{"$ref":"#/$defs/providerCapability"},"cuda":{"$ref":"#/$defs/providerCapability"},"directml":{"$ref":"#/$defs/providerCapability"},"rocm":{"$ref":"#/$defs/providerCapability"},"metal":{"$ref":"#/$defs/providerCapability"}}}},"$defs":{"availabilityStatus":{"title":"HostFactAvailabilityV1Wire","type":"string","enum":["available","unavailable","unknown"]},"knownLogicalProcessorCount":{"title":"KnownLogicalProcessorCountV1Wire","oneOf":[{"type":"object","additionalProperties":false,"required":["status","value"],"properties":{"status":{"const":"known"},"value":{"type":"integer","minimum":1,"maximum":1024}}},{"$ref":"#/$defs/unknownQuantity"}]},"knownPositiveMebibytes":{"title":"KnownPositiveMebibytesV1Wire","oneOf":[{"type":"object","additionalProperties":false,"required":["status","value"],"properties":{"status":{"const":"known"},"value":{"type":"integer","minimum":1,"maximum":16777216}}},{"$ref":"#/$defs/unknownQuantity"}]},"knownNonNegativeMebibytes":{"title":"KnownNonNegativeMebibytesV1Wire","oneOf":[{"type":"object","additionalProperties":false,"required":["status","value"],"properties":{"status":{"const":"known"},"value":{"type":"integer","minimum":0,"maximum":16777216}}},{"$ref":"#/$defs/unknownQuantity"}]},"unknownQuantity":{"title":"UnknownHostQuantityV1Wire","type":"object","additionalProperties":false,"required":["status"],"properties":{"status":{"const":"unknown"}}},"providerCapability":{"title":"HostProviderCapabilityV1Wire","type":"object","additionalProperties":false,"required":["availability","deviceClass","dedicatedMemoryMiB","availableDedicatedMemoryMiB","precisions"],"properties":{"availability":{"$ref":"#/$defs/availabilityStatus"},"deviceClass":{"type":"string","enum":["cpu","discrete-gpu","integrated-gpu","software","unknown"]},"dedicatedMemoryMiB":{"$ref":"#/$defs/knownNonNegativeMebibytes"},"availableDedicatedMemoryMiB":{"$ref":"#/$defs/knownNonNegativeMebibytes"},"precisions":{"type":"object","additionalProperties":false,"required":["float32","float16","bfloat16","int8"],"properties":{"float32":{"$ref":"#/$defs/availabilityStatus"},"float16":{"$ref":"#/$defs/availabilityStatus"},"bfloat16":{"$ref":"#/$defs/availabilityStatus"},"int8":{"$ref":"#/$defs/availabilityStatus"}}}}}}};
const schema93 = {"title":"KnownLogicalProcessorCountV1Wire","oneOf":[{"type":"object","additionalProperties":false,"required":["status","value"],"properties":{"status":{"const":"known"},"value":{"type":"integer","minimum":1,"maximum":1024}}},{"$ref":"#/$defs/unknownQuantity"}]};
const schema94 = {"title":"UnknownHostQuantityV1Wire","type":"object","additionalProperties":false,"required":["status"],"properties":{"status":{"const":"unknown"}}};

function validate38(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate38.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
const _errs0 = errors;
let valid0 = false;
let passing0 = null;
const _errs1 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.status === undefined){
const err0 = {instancePath,schemaPath:"#/oneOf/0/required",keyword:"required",params:{missingProperty: "status"},message:"must have required property '"+"status"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.value === undefined){
const err1 = {instancePath,schemaPath:"#/oneOf/0/required",keyword:"required",params:{missingProperty: "value"},message:"must have required property '"+"value"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
for(const key0 in data){
if(!((key0 === "status") || (key0 === "value"))){
const err2 = {instancePath,schemaPath:"#/oneOf/0/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
if(data.status !== undefined){
if("known" !== data.status){
const err3 = {instancePath:instancePath+"/status",schemaPath:"#/oneOf/0/properties/status/const",keyword:"const",params:{allowedValue: "known"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.value !== undefined){
let data1 = data.value;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err4 = {instancePath:instancePath+"/value",schemaPath:"#/oneOf/0/properties/value/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if((typeof data1 == "number") && (isFinite(data1))){
if(data1 > 1024 || isNaN(data1)){
const err5 = {instancePath:instancePath+"/value",schemaPath:"#/oneOf/0/properties/value/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1024},message:"must be <= 1024"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data1 < 1 || isNaN(data1)){
const err6 = {instancePath:instancePath+"/value",schemaPath:"#/oneOf/0/properties/value/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
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
}
else {
const err7 = {instancePath,schemaPath:"#/oneOf/0/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
var _valid0 = _errs1 === errors;
if(_valid0){
valid0 = true;
passing0 = 0;
var props0 = true;
}
const _errs7 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.status === undefined){
const err8 = {instancePath,schemaPath:"#/$defs/unknownQuantity/required",keyword:"required",params:{missingProperty: "status"},message:"must have required property '"+"status"+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
for(const key1 in data){
if(!(key1 === "status")){
const err9 = {instancePath,schemaPath:"#/$defs/unknownQuantity/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
if(data.status !== undefined){
if("unknown" !== data.status){
const err10 = {instancePath:instancePath+"/status",schemaPath:"#/$defs/unknownQuantity/properties/status/const",keyword:"const",params:{allowedValue: "unknown"},message:"must be equal to constant"};
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
const err11 = {instancePath,schemaPath:"#/$defs/unknownQuantity/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
var _valid0 = _errs7 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 1];
}
else {
if(_valid0){
valid0 = true;
passing0 = 1;
if(props0 !== true){
props0 = true;
}
}
}
if(!valid0){
const err12 = {instancePath,schemaPath:"#/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
else {
errors = _errs0;
if(vErrors !== null){
if(_errs0){
vErrors.length = _errs0;
}
else {
vErrors = null;
}
}
}
validate38.errors = vErrors;
evaluated0.props = props0;
return errors === 0;
}
validate38.evaluated = {"dynamicProps":true,"dynamicItems":false};

const schema95 = {"title":"KnownPositiveMebibytesV1Wire","oneOf":[{"type":"object","additionalProperties":false,"required":["status","value"],"properties":{"status":{"const":"known"},"value":{"type":"integer","minimum":1,"maximum":16777216}}},{"$ref":"#/$defs/unknownQuantity"}]};

function validate40(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate40.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
const _errs0 = errors;
let valid0 = false;
let passing0 = null;
const _errs1 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.status === undefined){
const err0 = {instancePath,schemaPath:"#/oneOf/0/required",keyword:"required",params:{missingProperty: "status"},message:"must have required property '"+"status"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.value === undefined){
const err1 = {instancePath,schemaPath:"#/oneOf/0/required",keyword:"required",params:{missingProperty: "value"},message:"must have required property '"+"value"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
for(const key0 in data){
if(!((key0 === "status") || (key0 === "value"))){
const err2 = {instancePath,schemaPath:"#/oneOf/0/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
if(data.status !== undefined){
if("known" !== data.status){
const err3 = {instancePath:instancePath+"/status",schemaPath:"#/oneOf/0/properties/status/const",keyword:"const",params:{allowedValue: "known"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.value !== undefined){
let data1 = data.value;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err4 = {instancePath:instancePath+"/value",schemaPath:"#/oneOf/0/properties/value/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if((typeof data1 == "number") && (isFinite(data1))){
if(data1 > 16777216 || isNaN(data1)){
const err5 = {instancePath:instancePath+"/value",schemaPath:"#/oneOf/0/properties/value/maximum",keyword:"maximum",params:{comparison: "<=", limit: 16777216},message:"must be <= 16777216"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data1 < 1 || isNaN(data1)){
const err6 = {instancePath:instancePath+"/value",schemaPath:"#/oneOf/0/properties/value/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
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
}
else {
const err7 = {instancePath,schemaPath:"#/oneOf/0/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
var _valid0 = _errs1 === errors;
if(_valid0){
valid0 = true;
passing0 = 0;
var props0 = true;
}
const _errs7 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.status === undefined){
const err8 = {instancePath,schemaPath:"#/$defs/unknownQuantity/required",keyword:"required",params:{missingProperty: "status"},message:"must have required property '"+"status"+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
for(const key1 in data){
if(!(key1 === "status")){
const err9 = {instancePath,schemaPath:"#/$defs/unknownQuantity/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
if(data.status !== undefined){
if("unknown" !== data.status){
const err10 = {instancePath:instancePath+"/status",schemaPath:"#/$defs/unknownQuantity/properties/status/const",keyword:"const",params:{allowedValue: "unknown"},message:"must be equal to constant"};
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
const err11 = {instancePath,schemaPath:"#/$defs/unknownQuantity/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
var _valid0 = _errs7 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 1];
}
else {
if(_valid0){
valid0 = true;
passing0 = 1;
if(props0 !== true){
props0 = true;
}
}
}
if(!valid0){
const err12 = {instancePath,schemaPath:"#/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
else {
errors = _errs0;
if(vErrors !== null){
if(_errs0){
vErrors.length = _errs0;
}
else {
vErrors = null;
}
}
}
validate40.errors = vErrors;
evaluated0.props = props0;
return errors === 0;
}
validate40.evaluated = {"dynamicProps":true,"dynamicItems":false};

const schema97 = {"title":"KnownNonNegativeMebibytesV1Wire","oneOf":[{"type":"object","additionalProperties":false,"required":["status","value"],"properties":{"status":{"const":"known"},"value":{"type":"integer","minimum":0,"maximum":16777216}}},{"$ref":"#/$defs/unknownQuantity"}]};

function validate42(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate42.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
const _errs0 = errors;
let valid0 = false;
let passing0 = null;
const _errs1 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.status === undefined){
const err0 = {instancePath,schemaPath:"#/oneOf/0/required",keyword:"required",params:{missingProperty: "status"},message:"must have required property '"+"status"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.value === undefined){
const err1 = {instancePath,schemaPath:"#/oneOf/0/required",keyword:"required",params:{missingProperty: "value"},message:"must have required property '"+"value"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
for(const key0 in data){
if(!((key0 === "status") || (key0 === "value"))){
const err2 = {instancePath,schemaPath:"#/oneOf/0/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
if(data.status !== undefined){
if("known" !== data.status){
const err3 = {instancePath:instancePath+"/status",schemaPath:"#/oneOf/0/properties/status/const",keyword:"const",params:{allowedValue: "known"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.value !== undefined){
let data1 = data.value;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err4 = {instancePath:instancePath+"/value",schemaPath:"#/oneOf/0/properties/value/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if((typeof data1 == "number") && (isFinite(data1))){
if(data1 > 16777216 || isNaN(data1)){
const err5 = {instancePath:instancePath+"/value",schemaPath:"#/oneOf/0/properties/value/maximum",keyword:"maximum",params:{comparison: "<=", limit: 16777216},message:"must be <= 16777216"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data1 < 0 || isNaN(data1)){
const err6 = {instancePath:instancePath+"/value",schemaPath:"#/oneOf/0/properties/value/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
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
}
else {
const err7 = {instancePath,schemaPath:"#/oneOf/0/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
var _valid0 = _errs1 === errors;
if(_valid0){
valid0 = true;
passing0 = 0;
var props0 = true;
}
const _errs7 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.status === undefined){
const err8 = {instancePath,schemaPath:"#/$defs/unknownQuantity/required",keyword:"required",params:{missingProperty: "status"},message:"must have required property '"+"status"+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
for(const key1 in data){
if(!(key1 === "status")){
const err9 = {instancePath,schemaPath:"#/$defs/unknownQuantity/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
if(data.status !== undefined){
if("unknown" !== data.status){
const err10 = {instancePath:instancePath+"/status",schemaPath:"#/$defs/unknownQuantity/properties/status/const",keyword:"const",params:{allowedValue: "unknown"},message:"must be equal to constant"};
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
const err11 = {instancePath,schemaPath:"#/$defs/unknownQuantity/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
var _valid0 = _errs7 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 1];
}
else {
if(_valid0){
valid0 = true;
passing0 = 1;
if(props0 !== true){
props0 = true;
}
}
}
if(!valid0){
const err12 = {instancePath,schemaPath:"#/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
else {
errors = _errs0;
if(vErrors !== null){
if(_errs0){
vErrors.length = _errs0;
}
else {
vErrors = null;
}
}
}
validate42.errors = vErrors;
evaluated0.props = props0;
return errors === 0;
}
validate42.evaluated = {"dynamicProps":true,"dynamicItems":false};

const schema99 = {"title":"HostProviderCapabilityV1Wire","type":"object","additionalProperties":false,"required":["availability","deviceClass","dedicatedMemoryMiB","availableDedicatedMemoryMiB","precisions"],"properties":{"availability":{"$ref":"#/$defs/availabilityStatus"},"deviceClass":{"type":"string","enum":["cpu","discrete-gpu","integrated-gpu","software","unknown"]},"dedicatedMemoryMiB":{"$ref":"#/$defs/knownNonNegativeMebibytes"},"availableDedicatedMemoryMiB":{"$ref":"#/$defs/knownNonNegativeMebibytes"},"precisions":{"type":"object","additionalProperties":false,"required":["float32","float16","bfloat16","int8"],"properties":{"float32":{"$ref":"#/$defs/availabilityStatus"},"float16":{"$ref":"#/$defs/availabilityStatus"},"bfloat16":{"$ref":"#/$defs/availabilityStatus"},"int8":{"$ref":"#/$defs/availabilityStatus"}}}}};
const schema100 = {"title":"HostFactAvailabilityV1Wire","type":"string","enum":["available","unavailable","unknown"]};

function validate45(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
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
if(data.availability === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "availability"},message:"must have required property '"+"availability"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.deviceClass === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "deviceClass"},message:"must have required property '"+"deviceClass"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.dedicatedMemoryMiB === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "dedicatedMemoryMiB"},message:"must have required property '"+"dedicatedMemoryMiB"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.availableDedicatedMemoryMiB === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "availableDedicatedMemoryMiB"},message:"must have required property '"+"availableDedicatedMemoryMiB"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.precisions === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "precisions"},message:"must have required property '"+"precisions"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
for(const key0 in data){
if(!(((((key0 === "availability") || (key0 === "deviceClass")) || (key0 === "dedicatedMemoryMiB")) || (key0 === "availableDedicatedMemoryMiB")) || (key0 === "precisions"))){
const err5 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.availability !== undefined){
let data0 = data.availability;
if(typeof data0 !== "string"){
const err6 = {instancePath:instancePath+"/availability",schemaPath:"#/$defs/availabilityStatus/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(!(((data0 === "available") || (data0 === "unavailable")) || (data0 === "unknown"))){
const err7 = {instancePath:instancePath+"/availability",schemaPath:"#/$defs/availabilityStatus/enum",keyword:"enum",params:{allowedValues: schema100.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.deviceClass !== undefined){
let data1 = data.deviceClass;
if(typeof data1 !== "string"){
const err8 = {instancePath:instancePath+"/deviceClass",schemaPath:"#/properties/deviceClass/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(!(((((data1 === "cpu") || (data1 === "discrete-gpu")) || (data1 === "integrated-gpu")) || (data1 === "software")) || (data1 === "unknown"))){
const err9 = {instancePath:instancePath+"/deviceClass",schemaPath:"#/properties/deviceClass/enum",keyword:"enum",params:{allowedValues: schema99.properties.deviceClass.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
if(data.dedicatedMemoryMiB !== undefined){
if(!(validate42(data.dedicatedMemoryMiB, {instancePath:instancePath+"/dedicatedMemoryMiB",parentData:data,parentDataProperty:"dedicatedMemoryMiB",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate42.errors : vErrors.concat(validate42.errors);
errors = vErrors.length;
}
}
if(data.availableDedicatedMemoryMiB !== undefined){
if(!(validate42(data.availableDedicatedMemoryMiB, {instancePath:instancePath+"/availableDedicatedMemoryMiB",parentData:data,parentDataProperty:"availableDedicatedMemoryMiB",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate42.errors : vErrors.concat(validate42.errors);
errors = vErrors.length;
}
}
if(data.precisions !== undefined){
let data4 = data.precisions;
if(data4 && typeof data4 == "object" && !Array.isArray(data4)){
if(data4.float32 === undefined){
const err10 = {instancePath:instancePath+"/precisions",schemaPath:"#/properties/precisions/required",keyword:"required",params:{missingProperty: "float32"},message:"must have required property '"+"float32"+"'"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if(data4.float16 === undefined){
const err11 = {instancePath:instancePath+"/precisions",schemaPath:"#/properties/precisions/required",keyword:"required",params:{missingProperty: "float16"},message:"must have required property '"+"float16"+"'"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
if(data4.bfloat16 === undefined){
const err12 = {instancePath:instancePath+"/precisions",schemaPath:"#/properties/precisions/required",keyword:"required",params:{missingProperty: "bfloat16"},message:"must have required property '"+"bfloat16"+"'"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
if(data4.int8 === undefined){
const err13 = {instancePath:instancePath+"/precisions",schemaPath:"#/properties/precisions/required",keyword:"required",params:{missingProperty: "int8"},message:"must have required property '"+"int8"+"'"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
for(const key1 in data4){
if(!((((key1 === "float32") || (key1 === "float16")) || (key1 === "bfloat16")) || (key1 === "int8"))){
const err14 = {instancePath:instancePath+"/precisions",schemaPath:"#/properties/precisions/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
if(data4.float32 !== undefined){
let data5 = data4.float32;
if(typeof data5 !== "string"){
const err15 = {instancePath:instancePath+"/precisions/float32",schemaPath:"#/$defs/availabilityStatus/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
if(!(((data5 === "available") || (data5 === "unavailable")) || (data5 === "unknown"))){
const err16 = {instancePath:instancePath+"/precisions/float32",schemaPath:"#/$defs/availabilityStatus/enum",keyword:"enum",params:{allowedValues: schema100.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
if(data4.float16 !== undefined){
let data6 = data4.float16;
if(typeof data6 !== "string"){
const err17 = {instancePath:instancePath+"/precisions/float16",schemaPath:"#/$defs/availabilityStatus/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
if(!(((data6 === "available") || (data6 === "unavailable")) || (data6 === "unknown"))){
const err18 = {instancePath:instancePath+"/precisions/float16",schemaPath:"#/$defs/availabilityStatus/enum",keyword:"enum",params:{allowedValues: schema100.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
if(data4.bfloat16 !== undefined){
let data7 = data4.bfloat16;
if(typeof data7 !== "string"){
const err19 = {instancePath:instancePath+"/precisions/bfloat16",schemaPath:"#/$defs/availabilityStatus/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
if(!(((data7 === "available") || (data7 === "unavailable")) || (data7 === "unknown"))){
const err20 = {instancePath:instancePath+"/precisions/bfloat16",schemaPath:"#/$defs/availabilityStatus/enum",keyword:"enum",params:{allowedValues: schema100.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
if(data4.int8 !== undefined){
let data8 = data4.int8;
if(typeof data8 !== "string"){
const err21 = {instancePath:instancePath+"/precisions/int8",schemaPath:"#/$defs/availabilityStatus/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
if(!(((data8 === "available") || (data8 === "unavailable")) || (data8 === "unknown"))){
const err22 = {instancePath:instancePath+"/precisions/int8",schemaPath:"#/$defs/availabilityStatus/enum",keyword:"enum",params:{allowedValues: schema100.enum},message:"must be equal to one of the allowed values"};
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
const err23 = {instancePath:instancePath+"/precisions",schemaPath:"#/properties/precisions/type",keyword:"type",params:{type: "object"},message:"must be object"};
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
validate45.errors = vErrors;
return errors === 0;
}
validate45.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate37(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="urn:voxleaf:schema:host-profile-compatibility-report:v1" */;
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
if(data.probeStatus === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "probeStatus"},message:"must have required property '"+"probeStatus"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.platform === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "platform"},message:"must have required property '"+"platform"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.processor === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "processor"},message:"must have required property '"+"processor"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.memory === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "memory"},message:"must have required property '"+"memory"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.storage === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "storage"},message:"must have required property '"+"storage"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data.providers === undefined){
const err6 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "providers"},message:"must have required property '"+"providers"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
for(const key0 in data){
if(!(((((((key0 === "schemaVersion") || (key0 === "probeStatus")) || (key0 === "platform")) || (key0 === "processor")) || (key0 === "memory")) || (key0 === "storage")) || (key0 === "providers"))){
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
if(data.probeStatus !== undefined){
let data1 = data.probeStatus;
if(typeof data1 !== "string"){
const err12 = {instancePath:instancePath+"/probeStatus",schemaPath:"#/properties/probeStatus/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
if(!((((data1 === "complete") || (data1 === "partial")) || (data1 === "permission-denied")) || (data1 === "unavailable"))){
const err13 = {instancePath:instancePath+"/probeStatus",schemaPath:"#/properties/probeStatus/enum",keyword:"enum",params:{allowedValues: schema91.properties.probeStatus.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
if(data.platform !== undefined){
let data2 = data.platform;
if(data2 && typeof data2 == "object" && !Array.isArray(data2)){
if(data2.operatingSystem === undefined){
const err14 = {instancePath:instancePath+"/platform",schemaPath:"#/properties/platform/required",keyword:"required",params:{missingProperty: "operatingSystem"},message:"must have required property '"+"operatingSystem"+"'"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
if(data2.architecture === undefined){
const err15 = {instancePath:instancePath+"/platform",schemaPath:"#/properties/platform/required",keyword:"required",params:{missingProperty: "architecture"},message:"must have required property '"+"architecture"+"'"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
for(const key1 in data2){
if(!((key1 === "operatingSystem") || (key1 === "architecture"))){
const err16 = {instancePath:instancePath+"/platform",schemaPath:"#/properties/platform/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
if(data2.operatingSystem !== undefined){
let data3 = data2.operatingSystem;
if(typeof data3 !== "string"){
const err17 = {instancePath:instancePath+"/platform/operatingSystem",schemaPath:"#/properties/platform/properties/operatingSystem/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
if(!(((((data3 === "windows") || (data3 === "linux")) || (data3 === "macos")) || (data3 === "other")) || (data3 === "unknown"))){
const err18 = {instancePath:instancePath+"/platform/operatingSystem",schemaPath:"#/properties/platform/properties/operatingSystem/enum",keyword:"enum",params:{allowedValues: schema91.properties.platform.properties.operatingSystem.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
if(data2.architecture !== undefined){
let data4 = data2.architecture;
if(typeof data4 !== "string"){
const err19 = {instancePath:instancePath+"/platform/architecture",schemaPath:"#/properties/platform/properties/architecture/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
if(!((((data4 === "x86_64") || (data4 === "aarch64")) || (data4 === "other")) || (data4 === "unknown"))){
const err20 = {instancePath:instancePath+"/platform/architecture",schemaPath:"#/properties/platform/properties/architecture/enum",keyword:"enum",params:{allowedValues: schema91.properties.platform.properties.architecture.enum},message:"must be equal to one of the allowed values"};
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
else {
const err21 = {instancePath:instancePath+"/platform",schemaPath:"#/properties/platform/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
if(data.processor !== undefined){
let data5 = data.processor;
if(data5 && typeof data5 == "object" && !Array.isArray(data5)){
if(data5.logicalProcessorCount === undefined){
const err22 = {instancePath:instancePath+"/processor",schemaPath:"#/properties/processor/required",keyword:"required",params:{missingProperty: "logicalProcessorCount"},message:"must have required property '"+"logicalProcessorCount"+"'"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
for(const key2 in data5){
if(!(key2 === "logicalProcessorCount")){
const err23 = {instancePath:instancePath+"/processor",schemaPath:"#/properties/processor/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
if(data5.logicalProcessorCount !== undefined){
if(!(validate38(data5.logicalProcessorCount, {instancePath:instancePath+"/processor/logicalProcessorCount",parentData:data5,parentDataProperty:"logicalProcessorCount",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate38.errors : vErrors.concat(validate38.errors);
errors = vErrors.length;
}
}
}
else {
const err24 = {instancePath:instancePath+"/processor",schemaPath:"#/properties/processor/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
if(data.memory !== undefined){
let data7 = data.memory;
if(data7 && typeof data7 == "object" && !Array.isArray(data7)){
if(data7.totalPhysicalMiB === undefined){
const err25 = {instancePath:instancePath+"/memory",schemaPath:"#/properties/memory/required",keyword:"required",params:{missingProperty: "totalPhysicalMiB"},message:"must have required property '"+"totalPhysicalMiB"+"'"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
if(data7.availablePhysicalMiB === undefined){
const err26 = {instancePath:instancePath+"/memory",schemaPath:"#/properties/memory/required",keyword:"required",params:{missingProperty: "availablePhysicalMiB"},message:"must have required property '"+"availablePhysicalMiB"+"'"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
for(const key3 in data7){
if(!((key3 === "totalPhysicalMiB") || (key3 === "availablePhysicalMiB"))){
const err27 = {instancePath:instancePath+"/memory",schemaPath:"#/properties/memory/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key3},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
if(data7.totalPhysicalMiB !== undefined){
if(!(validate40(data7.totalPhysicalMiB, {instancePath:instancePath+"/memory/totalPhysicalMiB",parentData:data7,parentDataProperty:"totalPhysicalMiB",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate40.errors : vErrors.concat(validate40.errors);
errors = vErrors.length;
}
}
if(data7.availablePhysicalMiB !== undefined){
if(!(validate42(data7.availablePhysicalMiB, {instancePath:instancePath+"/memory/availablePhysicalMiB",parentData:data7,parentDataProperty:"availablePhysicalMiB",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate42.errors : vErrors.concat(validate42.errors);
errors = vErrors.length;
}
}
}
else {
const err28 = {instancePath:instancePath+"/memory",schemaPath:"#/properties/memory/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
if(data.storage !== undefined){
let data10 = data.storage;
if(data10 && typeof data10 == "object" && !Array.isArray(data10)){
if(data10.applicationVolumeAvailableMiB === undefined){
const err29 = {instancePath:instancePath+"/storage",schemaPath:"#/properties/storage/required",keyword:"required",params:{missingProperty: "applicationVolumeAvailableMiB"},message:"must have required property '"+"applicationVolumeAvailableMiB"+"'"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
for(const key4 in data10){
if(!(key4 === "applicationVolumeAvailableMiB")){
const err30 = {instancePath:instancePath+"/storage",schemaPath:"#/properties/storage/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key4},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
}
if(data10.applicationVolumeAvailableMiB !== undefined){
if(!(validate42(data10.applicationVolumeAvailableMiB, {instancePath:instancePath+"/storage/applicationVolumeAvailableMiB",parentData:data10,parentDataProperty:"applicationVolumeAvailableMiB",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate42.errors : vErrors.concat(validate42.errors);
errors = vErrors.length;
}
}
}
else {
const err31 = {instancePath:instancePath+"/storage",schemaPath:"#/properties/storage/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
}
if(data.providers !== undefined){
let data12 = data.providers;
if(data12 && typeof data12 == "object" && !Array.isArray(data12)){
if(data12.cpu === undefined){
const err32 = {instancePath:instancePath+"/providers",schemaPath:"#/properties/providers/required",keyword:"required",params:{missingProperty: "cpu"},message:"must have required property '"+"cpu"+"'"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
if(data12.cuda === undefined){
const err33 = {instancePath:instancePath+"/providers",schemaPath:"#/properties/providers/required",keyword:"required",params:{missingProperty: "cuda"},message:"must have required property '"+"cuda"+"'"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
if(data12.directml === undefined){
const err34 = {instancePath:instancePath+"/providers",schemaPath:"#/properties/providers/required",keyword:"required",params:{missingProperty: "directml"},message:"must have required property '"+"directml"+"'"};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
if(data12.rocm === undefined){
const err35 = {instancePath:instancePath+"/providers",schemaPath:"#/properties/providers/required",keyword:"required",params:{missingProperty: "rocm"},message:"must have required property '"+"rocm"+"'"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
if(data12.metal === undefined){
const err36 = {instancePath:instancePath+"/providers",schemaPath:"#/properties/providers/required",keyword:"required",params:{missingProperty: "metal"},message:"must have required property '"+"metal"+"'"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
for(const key5 in data12){
if(!(((((key5 === "cpu") || (key5 === "cuda")) || (key5 === "directml")) || (key5 === "rocm")) || (key5 === "metal"))){
const err37 = {instancePath:instancePath+"/providers",schemaPath:"#/properties/providers/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key5},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
}
if(data12.cpu !== undefined){
if(!(validate45(data12.cpu, {instancePath:instancePath+"/providers/cpu",parentData:data12,parentDataProperty:"cpu",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate45.errors : vErrors.concat(validate45.errors);
errors = vErrors.length;
}
}
if(data12.cuda !== undefined){
if(!(validate45(data12.cuda, {instancePath:instancePath+"/providers/cuda",parentData:data12,parentDataProperty:"cuda",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate45.errors : vErrors.concat(validate45.errors);
errors = vErrors.length;
}
}
if(data12.directml !== undefined){
if(!(validate45(data12.directml, {instancePath:instancePath+"/providers/directml",parentData:data12,parentDataProperty:"directml",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate45.errors : vErrors.concat(validate45.errors);
errors = vErrors.length;
}
}
if(data12.rocm !== undefined){
if(!(validate45(data12.rocm, {instancePath:instancePath+"/providers/rocm",parentData:data12,parentDataProperty:"rocm",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate45.errors : vErrors.concat(validate45.errors);
errors = vErrors.length;
}
}
if(data12.metal !== undefined){
if(!(validate45(data12.metal, {instancePath:instancePath+"/providers/metal",parentData:data12,parentDataProperty:"metal",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate45.errors : vErrors.concat(validate45.errors);
errors = vErrors.length;
}
}
}
else {
const err38 = {instancePath:instancePath+"/providers",schemaPath:"#/properties/providers/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
}
}
else {
const err39 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err39];
}
else {
vErrors.push(err39);
}
errors++;
}
validate37.errors = vErrors;
return errors === 0;
}
validate37.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateLocatorRangeV1Wire = validate53;
const schema105 = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"urn:voxleaf:schema:locator-range:v1","title":"LocatorRangeV1Wire","description":"An ordered content-free range between two logical reading positions.","$comment":"Semantic validation requires matching book identities and nondecreasing (spineItemIndex, anchorIndex, textOffsetCodePoints) position order.","type":"object","additionalProperties":false,"required":["schemaVersion","start","end"],"properties":{"schemaVersion":{"allOf":[{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion"},{"const":1}]},"start":{"$ref":"urn:voxleaf:schema:locator:v1"},"end":{"$ref":"urn:voxleaf:schema:locator:v1"}}};
const schema107 = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"urn:voxleaf:schema:locator:v1","title":"ReadingLocatorV1Wire","description":"A content-free, layout-independent logical position within one book.","type":"object","additionalProperties":false,"required":["schemaVersion","bookIdentity","spineItemId","spineItemIndex","anchor","textOffsetCodePoints"],"properties":{"schemaVersion":{"allOf":[{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion"},{"const":1}]},"bookIdentity":{"$ref":"urn:voxleaf:schema:book:v1#/$defs/bookIdentity"},"spineItemId":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/spineItemId"},"spineItemIndex":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/index","description":"Zero-based position of the spine item in the validated book contract."},"anchor":{"$ref":"#/$defs/structuralAnchor"},"textOffsetCodePoints":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/index","description":"Zero-based Unicode code-point offset within the anchored text representation."},"progression":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/progression","description":"Optional book-level progression used only for recovery and progress display."}},"$defs":{"structuralAnchor":{"title":"StructuralAnchorV1Wire","type":"object","additionalProperties":false,"required":["kind","formatVersion","value","anchorIndex"],"properties":{"kind":{"const":"element-id"},"formatVersion":{"allOf":[{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion"},{"const":1}]},"value":{"title":"StructuralAnchorValueWire","description":"Opaque structural element identifier; never a text quotation.","type":"string","minLength":1,"maxLength":128,"pattern":"^[A-Za-z0-9_][A-Za-z0-9._:-]*$"},"anchorIndex":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/index","description":"Zero-based structural anchor order within the spine item."}}}}};
const schema46 = {"title":"ProgressionWire","type":"number","minimum":0,"maximum":1};

function validate55(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate55.evaluated;
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
validate55.errors = vErrors;
return errors === 0;
}
validate55.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema114 = {"title":"StructuralAnchorV1Wire","type":"object","additionalProperties":false,"required":["kind","formatVersion","value","anchorIndex"],"properties":{"kind":{"const":"element-id"},"formatVersion":{"allOf":[{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion"},{"const":1}]},"value":{"title":"StructuralAnchorValueWire","description":"Opaque structural element identifier; never a text quotation.","type":"string","minLength":1,"maxLength":128,"pattern":"^[A-Za-z0-9_][A-Za-z0-9._:-]*$"},"anchorIndex":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/index","description":"Zero-based structural anchor order within the spine item."}}};
const pattern31 = new RegExp("^[A-Za-z0-9_][A-Za-z0-9._:-]*$", "u");

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
validate57.errors = vErrors;
return errors === 0;
}
validate57.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate54(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="urn:voxleaf:schema:locator:v1" */;
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
if(!(validate55(data.bookIdentity, {instancePath:instancePath+"/bookIdentity",parentData:data,parentDataProperty:"bookIdentity",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate55.errors : vErrors.concat(validate55.errors);
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
if(!(validate57(data.anchor, {instancePath:instancePath+"/anchor",parentData:data,parentDataProperty:"anchor",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate57.errors : vErrors.concat(validate57.errors);
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
validate54.errors = vErrors;
return errors === 0;
}
validate54.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate53(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="urn:voxleaf:schema:locator-range:v1" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate53.evaluated;
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
if(!(validate54(data.start, {instancePath:instancePath+"/start",parentData:data,parentDataProperty:"start",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
errors = vErrors.length;
}
}
if(data.end !== undefined){
if(!(validate54(data.end, {instancePath:instancePath+"/end",parentData:data,parentDataProperty:"end",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
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
validate53.errors = vErrors;
return errors === 0;
}
validate53.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateReadingLocatorV1Wire = validate54;

export const validateNarrationSegmentV1Wire = validate61;
const schema119 = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"urn:voxleaf:schema:narration-segment:v1","title":"NarrationSegmentV1Wire","description":"One sensitive narration payload tied to a stable reading range and asynchronous work identity.","type":"object","additionalProperties":false,"required":["schemaVersion","segmentId","bookIdentity","sessionId","generationId","sequence","sourceRange","text"],"properties":{"schemaVersion":{"allOf":[{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion"},{"const":1}]},"segmentId":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/segmentId"},"bookIdentity":{"$ref":"urn:voxleaf:schema:book:v1#/$defs/bookIdentity"},"sessionId":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/sessionId"},"generationId":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/generationId"},"sequence":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/index","description":"Zero-based order within the active generation; segment production rules remain external."},"sourceRange":{"$ref":"urn:voxleaf:schema:locator-range:v1","description":"The ordered logical reading range that supplied this narration text."},"text":{"type":"string","minLength":1,"description":"Sensitive narration text. It must not be copied into errors, metrics, persisted reading state, or debug snapshots."}}};

function validate62(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate62.evaluated;
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
validate62.errors = vErrors;
return errors === 0;
}
validate62.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate61(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="urn:voxleaf:schema:narration-segment:v1" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate61.evaluated;
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
if(!(validate62(data.bookIdentity, {instancePath:instancePath+"/bookIdentity",parentData:data,parentDataProperty:"bookIdentity",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate62.errors : vErrors.concat(validate62.errors);
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
if(!(validate53(data.sourceRange, {instancePath:instancePath+"/sourceRange",parentData:data,parentDataProperty:"sourceRange",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate53.errors : vErrors.concat(validate53.errors);
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
validate61.errors = vErrors;
return errors === 0;
}
validate61.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateOperationalErrorV1Wire = validate65;
const schema128 = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"urn:voxleaf:schema:operational-error:v1","title":"OperationalErrorV1Wire","description":"A privacy-safe machine-readable failure without content, paths, stack traces, or implementation details.","type":"object","additionalProperties":false,"required":["schemaVersion","code","category","severity"],"properties":{"schemaVersion":{"allOf":[{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion"},{"const":1}]},"code":{"type":"string","enum":["invalid-input","unsupported-input","capability-unavailable","operation-cancelled","resource-exhausted","internal-failure"],"description":"Stable machine-readable error code. Presentation layers map it to safe localized text."},"category":{"type":"string","enum":["input","availability","cancellation","resource","internal"]},"severity":{"type":"string","enum":["recoverable","fatal"],"description":"Whether the owning workflow can offer a safe recovery path or must stop."}}};

function validate65(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="urn:voxleaf:schema:operational-error:v1" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate65.evaluated;
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
const err10 = {instancePath:instancePath+"/code",schemaPath:"#/properties/code/enum",keyword:"enum",params:{allowedValues: schema128.properties.code.enum},message:"must be equal to one of the allowed values"};
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
const err12 = {instancePath:instancePath+"/category",schemaPath:"#/properties/category/enum",keyword:"enum",params:{allowedValues: schema128.properties.category.enum},message:"must be equal to one of the allowed values"};
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
const err14 = {instancePath:instancePath+"/severity",schemaPath:"#/properties/severity/enum",keyword:"enum",params:{allowedValues: schema128.properties.severity.enum},message:"must be equal to one of the allowed values"};
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
validate65.errors = vErrors;
return errors === 0;
}
validate65.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validatePersistedReadingStateV1Wire = validate66;
const schema130 = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"urn:voxleaf:schema:persisted-reading-state:v1","title":"PersistedReadingStateV1Wire","description":"Content-free local reading state for one book without choosing a storage implementation.","type":"object","additionalProperties":false,"required":["schemaVersion","bookIdentity","locator","preferences"],"properties":{"schemaVersion":{"allOf":[{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion"},{"const":1}]},"bookIdentity":{"$ref":"urn:voxleaf:schema:book:v1#/$defs/bookIdentity"},"locator":{"$ref":"urn:voxleaf:schema:locator:v1","description":"The authoritative layout-independent reading position."},"preferences":{"$ref":"#/$defs/readingPreferences"}},"$defs":{"preferenceIdentifier":{"type":"string","minLength":1,"maxLength":128,"pattern":"^[A-Za-z0-9][A-Za-z0-9._:-]*$"},"readingPreferences":{"title":"PersistedReadingPreferencesV1Wire","description":"Minimal preferences already defined by product requirements; capability support is validated by later application layers.","type":"object","additionalProperties":false,"properties":{"selectedVoiceId":{"$ref":"#/$defs/preferenceIdentifier","description":"Opaque local voice identifier; never a filesystem path."},"playbackRate":{"type":"number","exclusiveMinimum":0,"description":"Positive requested playback-rate multiplier; later capability contracts determine supported values."}}}}};

function validate67(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate67.evaluated;
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
validate67.errors = vErrors;
return errors === 0;
}
validate67.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema135 = {"title":"PersistedReadingPreferencesV1Wire","description":"Minimal preferences already defined by product requirements; capability support is validated by later application layers.","type":"object","additionalProperties":false,"properties":{"selectedVoiceId":{"$ref":"#/$defs/preferenceIdentifier","description":"Opaque local voice identifier; never a filesystem path."},"playbackRate":{"type":"number","exclusiveMinimum":0,"description":"Positive requested playback-rate multiplier; later capability contracts determine supported values."}}};
const schema136 = {"type":"string","minLength":1,"maxLength":128,"pattern":"^[A-Za-z0-9][A-Za-z0-9._:-]*$"};
const pattern41 = new RegExp("^[A-Za-z0-9][A-Za-z0-9._:-]*$", "u");

function validate70(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate70.evaluated;
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
validate70.errors = vErrors;
return errors === 0;
}
validate70.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate66(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="urn:voxleaf:schema:persisted-reading-state:v1" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate66.evaluated;
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
if(!(validate67(data.bookIdentity, {instancePath:instancePath+"/bookIdentity",parentData:data,parentDataProperty:"bookIdentity",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate67.errors : vErrors.concat(validate67.errors);
errors = vErrors.length;
}
}
if(data.locator !== undefined){
if(!(validate54(data.locator, {instancePath:instancePath+"/locator",parentData:data,parentDataProperty:"locator",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
errors = vErrors.length;
}
}
if(data.preferences !== undefined){
if(!(validate70(data.preferences, {instancePath:instancePath+"/preferences",parentData:data,parentDataProperty:"preferences",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate70.errors : vErrors.concat(validate70.errors);
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
validate66.errors = vErrors;
return errors === 0;
}
validate66.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateReadingSessionV1Wire = validate72;
const schema137 = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"urn:voxleaf:schema:reading-session:v1","title":"ReadingSessionV1Wire","description":"The active book-reading session and generation used to reject stale asynchronous work.","type":"object","additionalProperties":false,"required":["schemaVersion","sessionId","bookIdentity","generationId"],"properties":{"schemaVersion":{"allOf":[{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion"},{"const":1}]},"sessionId":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/sessionId"},"bookIdentity":{"$ref":"urn:voxleaf:schema:book:v1#/$defs/bookIdentity"},"generationId":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/generationId","description":"The currently active generation within this session."}}};

function validate73(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate73.evaluated;
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
validate73.errors = vErrors;
return errors === 0;
}
validate73.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate72(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="urn:voxleaf:schema:reading-session:v1" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate72.evaluated;
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
if(!(validate73(data.bookIdentity, {instancePath:instancePath+"/bookIdentity",parentData:data,parentDataProperty:"bookIdentity",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate73.errors : vErrors.concat(validate73.errors);
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
validate72.errors = vErrors;
return errors === 0;
}
validate72.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateTtsProtocolControlV1Wire = validate75;
const schema144 = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"urn:voxleaf:schema:tts-protocol-control:v1","title":"TtsProtocolControlV1Wire","description":"Closed JSON control messages for VoxLeaf local TTS process protocol version 1. Raw PCM is carried only in a separate bounded audio record.","oneOf":[{"$ref":"#/$defs/handshake"},{"$ref":"#/$defs/load"},{"$ref":"#/$defs/warm"},{"$ref":"#/$defs/synthesize"},{"$ref":"#/$defs/cancel"},{"$ref":"#/$defs/health"},{"$ref":"#/$defs/shutdown"},{"$ref":"#/$defs/handshakeAccepted"},{"$ref":"#/$defs/state"},{"$ref":"#/$defs/capabilities"},{"$ref":"#/$defs/audioMetadata"},{"$ref":"#/$defs/completed"},{"$ref":"#/$defs/cancelled"},{"$ref":"#/$defs/error"},{"$ref":"#/$defs/protocolRejected"}],"$defs":{"schemaVersion":{"allOf":[{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion"},{"const":1}]},"protocolVersion":{"type":"integer","const":1},"serviceInstanceId":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/identifier"},"requestId":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/identifier"},"serviceState":{"type":"string","enum":["starting","handshaking","unloaded","loading","warming","ready","generating","cancelling","stopping","stopped","failed"]},"protocolReason":{"type":"string","enum":["malformed-frame","unsupported-protocol-version","unknown-record-kind","invalid-flags","empty-payload","over-limit","invalid-utf8","malformed-json","unknown-message-kind","unsupported-schema-version","invalid-message","invalid-state","identity-mismatch","duplicate-identity","sequence-gap","format-mismatch","busy","engine-failure","engine-timeout","operation-cancelled","resource-exhausted"]},"workIdentity":{"type":"object","additionalProperties":false,"required":["requestId","sessionId","generationId","segmentId"],"properties":{"requestId":{"$ref":"#/$defs/requestId"},"sessionId":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/sessionId"},"generationId":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/generationId"},"segmentId":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/segmentId"}}},"handshake":{"title":"TtsHandshakeV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","serviceInstanceId"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"handshake"},"serviceInstanceId":{"$ref":"#/$defs/serviceInstanceId"}}},"load":{"title":"TtsLoadV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","serviceInstanceId"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"load"},"serviceInstanceId":{"$ref":"#/$defs/serviceInstanceId"}}},"warm":{"title":"TtsWarmV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","serviceInstanceId"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"warm"},"serviceInstanceId":{"$ref":"#/$defs/serviceInstanceId"}}},"synthesize":{"title":"TtsSynthesizeV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","serviceInstanceId","requestId","segment"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"synthesize"},"serviceInstanceId":{"$ref":"#/$defs/serviceInstanceId"},"requestId":{"$ref":"#/$defs/requestId"},"segment":{"allOf":[{"$ref":"urn:voxleaf:schema:narration-segment:v1"},{"type":"object","properties":{"text":{"type":"string","minLength":1,"maxLength":640}}}]}}},"cancel":{"title":"TtsCancelV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","serviceInstanceId","workIdentity"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"cancel"},"serviceInstanceId":{"$ref":"#/$defs/serviceInstanceId"},"workIdentity":{"$ref":"#/$defs/workIdentity"}}},"health":{"title":"TtsHealthV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","serviceInstanceId"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"health"},"serviceInstanceId":{"$ref":"#/$defs/serviceInstanceId"}}},"shutdown":{"title":"TtsShutdownV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","serviceInstanceId"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"shutdown"},"serviceInstanceId":{"$ref":"#/$defs/serviceInstanceId"}}},"handshakeAccepted":{"title":"TtsHandshakeAcceptedV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","serviceInstanceId"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"handshakeAccepted"},"serviceInstanceId":{"$ref":"#/$defs/serviceInstanceId"}}},"state":{"title":"TtsStateV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","serviceInstanceId","state"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"state"},"serviceInstanceId":{"$ref":"#/$defs/serviceInstanceId"},"state":{"$ref":"#/$defs/serviceState"}}},"capabilities":{"title":"TtsCapabilitiesV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","serviceInstanceId","report","cancellationContainment"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"capabilities"},"serviceInstanceId":{"$ref":"#/$defs/serviceInstanceId"},"report":{"$ref":"urn:voxleaf:schema:capability-report:v1"},"cancellationContainment":{"const":"identity-invalidation-then-worker-termination"}}},"audioMetadata":{"title":"TtsAudioMetadataV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","serviceInstanceId","requestId","frame","sampleFormat","payloadBytes"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"audioMetadata"},"serviceInstanceId":{"$ref":"#/$defs/serviceInstanceId"},"requestId":{"$ref":"#/$defs/requestId"},"frame":{"allOf":[{"$ref":"urn:voxleaf:schema:audio-frame:v1"},{"type":"object","properties":{"sequence":{"const":0},"sampleRateHz":{"const":24000},"sampleCountSamples":{"type":"integer","minimum":1,"maximum":480000},"channelCount":{"const":1},"endOfSegment":{"const":true}}}]},"sampleFormat":{"const":"float32-le"},"payloadBytes":{"type":"integer","minimum":4,"maximum":1920000,"multipleOf":4}}},"completed":{"title":"TtsCompletedV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","serviceInstanceId","workIdentity"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"completed"},"serviceInstanceId":{"$ref":"#/$defs/serviceInstanceId"},"workIdentity":{"$ref":"#/$defs/workIdentity"}}},"cancelled":{"title":"TtsCancelledV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","serviceInstanceId","workIdentity"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"cancelled"},"serviceInstanceId":{"$ref":"#/$defs/serviceInstanceId"},"workIdentity":{"$ref":"#/$defs/workIdentity"}}},"error":{"title":"TtsErrorV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","serviceInstanceId","reason","error"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"error"},"serviceInstanceId":{"$ref":"#/$defs/serviceInstanceId"},"reason":{"$ref":"#/$defs/protocolReason"},"error":{"$ref":"urn:voxleaf:schema:operational-error:v1"},"workIdentity":{"$ref":"#/$defs/workIdentity"}}},"protocolRejected":{"title":"TtsProtocolRejectedV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","reason"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"protocolRejected"},"reason":{"$ref":"#/$defs/protocolReason"}}}}};
const schema145 = {"title":"TtsHandshakeV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","serviceInstanceId"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"handshake"},"serviceInstanceId":{"$ref":"#/$defs/serviceInstanceId"}}};
const schema148 = {"type":"integer","const":1};
const schema146 = {"allOf":[{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion"},{"const":1}]};

function validate77(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate77.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(!(((typeof data == "number") && (!(data % 1) && !isNaN(data))) && (isFinite(data)))){
const err0 = {instancePath,schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if((typeof data == "number") && (isFinite(data))){
if(data > 9007199254740991 || isNaN(data)){
const err1 = {instancePath,schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data < 1 || isNaN(data)){
const err2 = {instancePath,schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/schemaVersion/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
if(1 !== data){
const err3 = {instancePath,schemaPath:"#/allOf/1/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
validate77.errors = vErrors;
return errors === 0;
}
validate77.evaluated = {"dynamicProps":false,"dynamicItems":false};


function validate76(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate76.evaluated;
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
if(data.protocolVersion === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "protocolVersion"},message:"must have required property '"+"protocolVersion"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.kind === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "kind"},message:"must have required property '"+"kind"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.serviceInstanceId === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "serviceInstanceId"},message:"must have required property '"+"serviceInstanceId"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
for(const key0 in data){
if(!((((key0 === "schemaVersion") || (key0 === "protocolVersion")) || (key0 === "kind")) || (key0 === "serviceInstanceId"))){
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
if(!(validate77(data.schemaVersion, {instancePath:instancePath+"/schemaVersion",parentData:data,parentDataProperty:"schemaVersion",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate77.errors : vErrors.concat(validate77.errors);
errors = vErrors.length;
}
}
if(data.protocolVersion !== undefined){
let data1 = data.protocolVersion;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err5 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(1 !== data1){
const err6 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data.kind !== undefined){
if("handshake" !== data.kind){
const err7 = {instancePath:instancePath+"/kind",schemaPath:"#/properties/kind/const",keyword:"const",params:{allowedValue: "handshake"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.serviceInstanceId !== undefined){
let data3 = data.serviceInstanceId;
if(typeof data3 === "string"){
if(func2(data3) > 128){
const err8 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(func2(data3) < 1){
const err9 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(!pattern4.test(data3)){
const err10 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
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
const err11 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
}
else {
const err12 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
validate76.errors = vErrors;
return errors === 0;
}
validate76.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema150 = {"title":"TtsLoadV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","serviceInstanceId"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"load"},"serviceInstanceId":{"$ref":"#/$defs/serviceInstanceId"}}};

function validate80(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate80.evaluated;
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
if(data.protocolVersion === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "protocolVersion"},message:"must have required property '"+"protocolVersion"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.kind === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "kind"},message:"must have required property '"+"kind"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.serviceInstanceId === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "serviceInstanceId"},message:"must have required property '"+"serviceInstanceId"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
for(const key0 in data){
if(!((((key0 === "schemaVersion") || (key0 === "protocolVersion")) || (key0 === "kind")) || (key0 === "serviceInstanceId"))){
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
if(!(validate77(data.schemaVersion, {instancePath:instancePath+"/schemaVersion",parentData:data,parentDataProperty:"schemaVersion",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate77.errors : vErrors.concat(validate77.errors);
errors = vErrors.length;
}
}
if(data.protocolVersion !== undefined){
let data1 = data.protocolVersion;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err5 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(1 !== data1){
const err6 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data.kind !== undefined){
if("load" !== data.kind){
const err7 = {instancePath:instancePath+"/kind",schemaPath:"#/properties/kind/const",keyword:"const",params:{allowedValue: "load"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.serviceInstanceId !== undefined){
let data3 = data.serviceInstanceId;
if(typeof data3 === "string"){
if(func2(data3) > 128){
const err8 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(func2(data3) < 1){
const err9 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(!pattern4.test(data3)){
const err10 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
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
const err11 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
}
else {
const err12 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
validate80.errors = vErrors;
return errors === 0;
}
validate80.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema153 = {"title":"TtsWarmV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","serviceInstanceId"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"warm"},"serviceInstanceId":{"$ref":"#/$defs/serviceInstanceId"}}};

function validate83(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate83.evaluated;
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
if(data.protocolVersion === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "protocolVersion"},message:"must have required property '"+"protocolVersion"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.kind === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "kind"},message:"must have required property '"+"kind"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.serviceInstanceId === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "serviceInstanceId"},message:"must have required property '"+"serviceInstanceId"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
for(const key0 in data){
if(!((((key0 === "schemaVersion") || (key0 === "protocolVersion")) || (key0 === "kind")) || (key0 === "serviceInstanceId"))){
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
if(!(validate77(data.schemaVersion, {instancePath:instancePath+"/schemaVersion",parentData:data,parentDataProperty:"schemaVersion",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate77.errors : vErrors.concat(validate77.errors);
errors = vErrors.length;
}
}
if(data.protocolVersion !== undefined){
let data1 = data.protocolVersion;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err5 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(1 !== data1){
const err6 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data.kind !== undefined){
if("warm" !== data.kind){
const err7 = {instancePath:instancePath+"/kind",schemaPath:"#/properties/kind/const",keyword:"const",params:{allowedValue: "warm"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.serviceInstanceId !== undefined){
let data3 = data.serviceInstanceId;
if(typeof data3 === "string"){
if(func2(data3) > 128){
const err8 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(func2(data3) < 1){
const err9 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(!pattern4.test(data3)){
const err10 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
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
const err11 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
}
else {
const err12 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
validate83.errors = vErrors;
return errors === 0;
}
validate83.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema156 = {"title":"TtsSynthesizeV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","serviceInstanceId","requestId","segment"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"synthesize"},"serviceInstanceId":{"$ref":"#/$defs/serviceInstanceId"},"requestId":{"$ref":"#/$defs/requestId"},"segment":{"allOf":[{"$ref":"urn:voxleaf:schema:narration-segment:v1"},{"type":"object","properties":{"text":{"type":"string","minLength":1,"maxLength":640}}}]}}};

function validate86(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate86.evaluated;
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
if(data.protocolVersion === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "protocolVersion"},message:"must have required property '"+"protocolVersion"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.kind === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "kind"},message:"must have required property '"+"kind"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.serviceInstanceId === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "serviceInstanceId"},message:"must have required property '"+"serviceInstanceId"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.requestId === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "requestId"},message:"must have required property '"+"requestId"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.segment === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "segment"},message:"must have required property '"+"segment"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
for(const key0 in data){
if(!((((((key0 === "schemaVersion") || (key0 === "protocolVersion")) || (key0 === "kind")) || (key0 === "serviceInstanceId")) || (key0 === "requestId")) || (key0 === "segment"))){
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
if(!(validate77(data.schemaVersion, {instancePath:instancePath+"/schemaVersion",parentData:data,parentDataProperty:"schemaVersion",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate77.errors : vErrors.concat(validate77.errors);
errors = vErrors.length;
}
}
if(data.protocolVersion !== undefined){
let data1 = data.protocolVersion;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err7 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(1 !== data1){
const err8 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data.kind !== undefined){
if("synthesize" !== data.kind){
const err9 = {instancePath:instancePath+"/kind",schemaPath:"#/properties/kind/const",keyword:"const",params:{allowedValue: "synthesize"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
if(data.serviceInstanceId !== undefined){
let data3 = data.serviceInstanceId;
if(typeof data3 === "string"){
if(func2(data3) > 128){
const err10 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if(func2(data3) < 1){
const err11 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
if(!pattern4.test(data3)){
const err12 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
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
const err13 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
if(data.requestId !== undefined){
let data4 = data.requestId;
if(typeof data4 === "string"){
if(func2(data4) > 128){
const err14 = {instancePath:instancePath+"/requestId",schemaPath:"#/$defs/requestId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
if(func2(data4) < 1){
const err15 = {instancePath:instancePath+"/requestId",schemaPath:"#/$defs/requestId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
if(!pattern4.test(data4)){
const err16 = {instancePath:instancePath+"/requestId",schemaPath:"#/$defs/requestId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
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
const err17 = {instancePath:instancePath+"/requestId",schemaPath:"#/$defs/requestId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
if(data.segment !== undefined){
let data5 = data.segment;
if(!(validate61(data5, {instancePath:instancePath+"/segment",parentData:data,parentDataProperty:"segment",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate61.errors : vErrors.concat(validate61.errors);
errors = vErrors.length;
}
if(data5 && typeof data5 == "object" && !Array.isArray(data5)){
if(data5.text !== undefined){
let data6 = data5.text;
if(typeof data6 === "string"){
if(func2(data6) > 640){
const err18 = {instancePath:instancePath+"/segment/text",schemaPath:"#/properties/segment/allOf/1/properties/text/maxLength",keyword:"maxLength",params:{limit: 640},message:"must NOT have more than 640 characters"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
if(func2(data6) < 1){
const err19 = {instancePath:instancePath+"/segment/text",schemaPath:"#/properties/segment/allOf/1/properties/text/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
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
const err20 = {instancePath:instancePath+"/segment/text",schemaPath:"#/properties/segment/allOf/1/properties/text/type",keyword:"type",params:{type: "string"},message:"must be string"};
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
else {
const err21 = {instancePath:instancePath+"/segment",schemaPath:"#/properties/segment/allOf/1/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
}
else {
const err22 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
validate86.errors = vErrors;
return errors === 0;
}
validate86.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema160 = {"title":"TtsCancelV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","serviceInstanceId","workIdentity"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"cancel"},"serviceInstanceId":{"$ref":"#/$defs/serviceInstanceId"},"workIdentity":{"$ref":"#/$defs/workIdentity"}}};
const schema163 = {"type":"object","additionalProperties":false,"required":["requestId","sessionId","generationId","segmentId"],"properties":{"requestId":{"$ref":"#/$defs/requestId"},"sessionId":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/sessionId"},"generationId":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/generationId"},"segmentId":{"$ref":"urn:voxleaf:schema:primitives:v1#/$defs/segmentId"}}};

function validate92(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate92.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.requestId === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "requestId"},message:"must have required property '"+"requestId"+"'"};
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
if(data.segmentId === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "segmentId"},message:"must have required property '"+"segmentId"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
for(const key0 in data){
if(!((((key0 === "requestId") || (key0 === "sessionId")) || (key0 === "generationId")) || (key0 === "segmentId"))){
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
if(data.requestId !== undefined){
let data0 = data.requestId;
if(typeof data0 === "string"){
if(func2(data0) > 128){
const err5 = {instancePath:instancePath+"/requestId",schemaPath:"#/$defs/requestId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(func2(data0) < 1){
const err6 = {instancePath:instancePath+"/requestId",schemaPath:"#/$defs/requestId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(!pattern4.test(data0)){
const err7 = {instancePath:instancePath+"/requestId",schemaPath:"#/$defs/requestId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
else {
const err8 = {instancePath:instancePath+"/requestId",schemaPath:"#/$defs/requestId/type",keyword:"type",params:{type: "string"},message:"must be string"};
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
if(data.generationId !== undefined){
let data2 = data.generationId;
if(typeof data2 === "string"){
if(func2(data2) > 128){
const err13 = {instancePath:instancePath+"/generationId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/generationId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
if(func2(data2) < 1){
const err14 = {instancePath:instancePath+"/generationId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/generationId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
if(!pattern4.test(data2)){
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
if(data.segmentId !== undefined){
let data3 = data.segmentId;
if(typeof data3 === "string"){
if(func2(data3) > 128){
const err17 = {instancePath:instancePath+"/segmentId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/segmentId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
if(func2(data3) < 1){
const err18 = {instancePath:instancePath+"/segmentId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/segmentId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
if(!pattern4.test(data3)){
const err19 = {instancePath:instancePath+"/segmentId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/segmentId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
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
const err20 = {instancePath:instancePath+"/segmentId",schemaPath:"urn:voxleaf:schema:primitives:v1#/$defs/segmentId/type",keyword:"type",params:{type: "string"},message:"must be string"};
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
else {
const err21 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
validate92.errors = vErrors;
return errors === 0;
}
validate92.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate90(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate90.evaluated;
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
if(data.protocolVersion === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "protocolVersion"},message:"must have required property '"+"protocolVersion"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.kind === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "kind"},message:"must have required property '"+"kind"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.serviceInstanceId === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "serviceInstanceId"},message:"must have required property '"+"serviceInstanceId"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.workIdentity === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "workIdentity"},message:"must have required property '"+"workIdentity"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
for(const key0 in data){
if(!(((((key0 === "schemaVersion") || (key0 === "protocolVersion")) || (key0 === "kind")) || (key0 === "serviceInstanceId")) || (key0 === "workIdentity"))){
const err5 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.schemaVersion !== undefined){
if(!(validate77(data.schemaVersion, {instancePath:instancePath+"/schemaVersion",parentData:data,parentDataProperty:"schemaVersion",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate77.errors : vErrors.concat(validate77.errors);
errors = vErrors.length;
}
}
if(data.protocolVersion !== undefined){
let data1 = data.protocolVersion;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err6 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(1 !== data1){
const err7 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.kind !== undefined){
if("cancel" !== data.kind){
const err8 = {instancePath:instancePath+"/kind",schemaPath:"#/properties/kind/const",keyword:"const",params:{allowedValue: "cancel"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data.serviceInstanceId !== undefined){
let data3 = data.serviceInstanceId;
if(typeof data3 === "string"){
if(func2(data3) > 128){
const err9 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(func2(data3) < 1){
const err10 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if(!pattern4.test(data3)){
const err11 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
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
const err12 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data.workIdentity !== undefined){
if(!(validate92(data.workIdentity, {instancePath:instancePath+"/workIdentity",parentData:data,parentDataProperty:"workIdentity",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate92.errors : vErrors.concat(validate92.errors);
errors = vErrors.length;
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
validate90.errors = vErrors;
return errors === 0;
}
validate90.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema168 = {"title":"TtsHealthV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","serviceInstanceId"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"health"},"serviceInstanceId":{"$ref":"#/$defs/serviceInstanceId"}}};

function validate95(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate95.evaluated;
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
if(data.protocolVersion === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "protocolVersion"},message:"must have required property '"+"protocolVersion"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.kind === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "kind"},message:"must have required property '"+"kind"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.serviceInstanceId === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "serviceInstanceId"},message:"must have required property '"+"serviceInstanceId"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
for(const key0 in data){
if(!((((key0 === "schemaVersion") || (key0 === "protocolVersion")) || (key0 === "kind")) || (key0 === "serviceInstanceId"))){
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
if(!(validate77(data.schemaVersion, {instancePath:instancePath+"/schemaVersion",parentData:data,parentDataProperty:"schemaVersion",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate77.errors : vErrors.concat(validate77.errors);
errors = vErrors.length;
}
}
if(data.protocolVersion !== undefined){
let data1 = data.protocolVersion;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err5 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(1 !== data1){
const err6 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data.kind !== undefined){
if("health" !== data.kind){
const err7 = {instancePath:instancePath+"/kind",schemaPath:"#/properties/kind/const",keyword:"const",params:{allowedValue: "health"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.serviceInstanceId !== undefined){
let data3 = data.serviceInstanceId;
if(typeof data3 === "string"){
if(func2(data3) > 128){
const err8 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(func2(data3) < 1){
const err9 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(!pattern4.test(data3)){
const err10 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
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
const err11 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
}
else {
const err12 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
validate95.errors = vErrors;
return errors === 0;
}
validate95.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema171 = {"title":"TtsShutdownV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","serviceInstanceId"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"shutdown"},"serviceInstanceId":{"$ref":"#/$defs/serviceInstanceId"}}};

function validate98(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate98.evaluated;
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
if(data.protocolVersion === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "protocolVersion"},message:"must have required property '"+"protocolVersion"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.kind === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "kind"},message:"must have required property '"+"kind"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.serviceInstanceId === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "serviceInstanceId"},message:"must have required property '"+"serviceInstanceId"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
for(const key0 in data){
if(!((((key0 === "schemaVersion") || (key0 === "protocolVersion")) || (key0 === "kind")) || (key0 === "serviceInstanceId"))){
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
if(!(validate77(data.schemaVersion, {instancePath:instancePath+"/schemaVersion",parentData:data,parentDataProperty:"schemaVersion",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate77.errors : vErrors.concat(validate77.errors);
errors = vErrors.length;
}
}
if(data.protocolVersion !== undefined){
let data1 = data.protocolVersion;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err5 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(1 !== data1){
const err6 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data.kind !== undefined){
if("shutdown" !== data.kind){
const err7 = {instancePath:instancePath+"/kind",schemaPath:"#/properties/kind/const",keyword:"const",params:{allowedValue: "shutdown"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.serviceInstanceId !== undefined){
let data3 = data.serviceInstanceId;
if(typeof data3 === "string"){
if(func2(data3) > 128){
const err8 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(func2(data3) < 1){
const err9 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(!pattern4.test(data3)){
const err10 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
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
const err11 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
}
else {
const err12 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
validate98.errors = vErrors;
return errors === 0;
}
validate98.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema174 = {"title":"TtsHandshakeAcceptedV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","serviceInstanceId"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"handshakeAccepted"},"serviceInstanceId":{"$ref":"#/$defs/serviceInstanceId"}}};

function validate101(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate101.evaluated;
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
if(data.protocolVersion === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "protocolVersion"},message:"must have required property '"+"protocolVersion"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.kind === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "kind"},message:"must have required property '"+"kind"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.serviceInstanceId === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "serviceInstanceId"},message:"must have required property '"+"serviceInstanceId"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
for(const key0 in data){
if(!((((key0 === "schemaVersion") || (key0 === "protocolVersion")) || (key0 === "kind")) || (key0 === "serviceInstanceId"))){
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
if(!(validate77(data.schemaVersion, {instancePath:instancePath+"/schemaVersion",parentData:data,parentDataProperty:"schemaVersion",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate77.errors : vErrors.concat(validate77.errors);
errors = vErrors.length;
}
}
if(data.protocolVersion !== undefined){
let data1 = data.protocolVersion;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err5 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(1 !== data1){
const err6 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data.kind !== undefined){
if("handshakeAccepted" !== data.kind){
const err7 = {instancePath:instancePath+"/kind",schemaPath:"#/properties/kind/const",keyword:"const",params:{allowedValue: "handshakeAccepted"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.serviceInstanceId !== undefined){
let data3 = data.serviceInstanceId;
if(typeof data3 === "string"){
if(func2(data3) > 128){
const err8 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(func2(data3) < 1){
const err9 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(!pattern4.test(data3)){
const err10 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
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
const err11 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
}
else {
const err12 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
validate101.errors = vErrors;
return errors === 0;
}
validate101.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema177 = {"title":"TtsStateV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","serviceInstanceId","state"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"state"},"serviceInstanceId":{"$ref":"#/$defs/serviceInstanceId"},"state":{"$ref":"#/$defs/serviceState"}}};
const schema180 = {"type":"string","enum":["starting","handshaking","unloaded","loading","warming","ready","generating","cancelling","stopping","stopped","failed"]};

function validate104(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate104.evaluated;
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
if(data.protocolVersion === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "protocolVersion"},message:"must have required property '"+"protocolVersion"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.kind === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "kind"},message:"must have required property '"+"kind"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.serviceInstanceId === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "serviceInstanceId"},message:"must have required property '"+"serviceInstanceId"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.state === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "state"},message:"must have required property '"+"state"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
for(const key0 in data){
if(!(((((key0 === "schemaVersion") || (key0 === "protocolVersion")) || (key0 === "kind")) || (key0 === "serviceInstanceId")) || (key0 === "state"))){
const err5 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.schemaVersion !== undefined){
if(!(validate77(data.schemaVersion, {instancePath:instancePath+"/schemaVersion",parentData:data,parentDataProperty:"schemaVersion",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate77.errors : vErrors.concat(validate77.errors);
errors = vErrors.length;
}
}
if(data.protocolVersion !== undefined){
let data1 = data.protocolVersion;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err6 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(1 !== data1){
const err7 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.kind !== undefined){
if("state" !== data.kind){
const err8 = {instancePath:instancePath+"/kind",schemaPath:"#/properties/kind/const",keyword:"const",params:{allowedValue: "state"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data.serviceInstanceId !== undefined){
let data3 = data.serviceInstanceId;
if(typeof data3 === "string"){
if(func2(data3) > 128){
const err9 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(func2(data3) < 1){
const err10 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if(!pattern4.test(data3)){
const err11 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
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
const err12 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data.state !== undefined){
let data4 = data.state;
if(typeof data4 !== "string"){
const err13 = {instancePath:instancePath+"/state",schemaPath:"#/$defs/serviceState/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
if(!(((((((((((data4 === "starting") || (data4 === "handshaking")) || (data4 === "unloaded")) || (data4 === "loading")) || (data4 === "warming")) || (data4 === "ready")) || (data4 === "generating")) || (data4 === "cancelling")) || (data4 === "stopping")) || (data4 === "stopped")) || (data4 === "failed"))){
const err14 = {instancePath:instancePath+"/state",schemaPath:"#/$defs/serviceState/enum",keyword:"enum",params:{allowedValues: schema180.enum},message:"must be equal to one of the allowed values"};
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
validate104.errors = vErrors;
return errors === 0;
}
validate104.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema181 = {"title":"TtsCapabilitiesV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","serviceInstanceId","report","cancellationContainment"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"capabilities"},"serviceInstanceId":{"$ref":"#/$defs/serviceInstanceId"},"report":{"$ref":"urn:voxleaf:schema:capability-report:v1"},"cancellationContainment":{"const":"identity-invalidation-then-worker-termination"}}};

function validate107(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate107.evaluated;
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
if(data.protocolVersion === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "protocolVersion"},message:"must have required property '"+"protocolVersion"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.kind === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "kind"},message:"must have required property '"+"kind"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.serviceInstanceId === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "serviceInstanceId"},message:"must have required property '"+"serviceInstanceId"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.report === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "report"},message:"must have required property '"+"report"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.cancellationContainment === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "cancellationContainment"},message:"must have required property '"+"cancellationContainment"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
for(const key0 in data){
if(!((((((key0 === "schemaVersion") || (key0 === "protocolVersion")) || (key0 === "kind")) || (key0 === "serviceInstanceId")) || (key0 === "report")) || (key0 === "cancellationContainment"))){
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
if(!(validate77(data.schemaVersion, {instancePath:instancePath+"/schemaVersion",parentData:data,parentDataProperty:"schemaVersion",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate77.errors : vErrors.concat(validate77.errors);
errors = vErrors.length;
}
}
if(data.protocolVersion !== undefined){
let data1 = data.protocolVersion;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err7 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(1 !== data1){
const err8 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data.kind !== undefined){
if("capabilities" !== data.kind){
const err9 = {instancePath:instancePath+"/kind",schemaPath:"#/properties/kind/const",keyword:"const",params:{allowedValue: "capabilities"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
if(data.serviceInstanceId !== undefined){
let data3 = data.serviceInstanceId;
if(typeof data3 === "string"){
if(func2(data3) > 128){
const err10 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if(func2(data3) < 1){
const err11 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
if(!pattern4.test(data3)){
const err12 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
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
const err13 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
if(data.report !== undefined){
if(!(validate36(data.report, {instancePath:instancePath+"/report",parentData:data,parentDataProperty:"report",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate36.errors : vErrors.concat(validate36.errors);
errors = vErrors.length;
}
}
if(data.cancellationContainment !== undefined){
if("identity-invalidation-then-worker-termination" !== data.cancellationContainment){
const err14 = {instancePath:instancePath+"/cancellationContainment",schemaPath:"#/properties/cancellationContainment/const",keyword:"const",params:{allowedValue: "identity-invalidation-then-worker-termination"},message:"must be equal to constant"};
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
validate107.errors = vErrors;
return errors === 0;
}
validate107.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema184 = {"title":"TtsAudioMetadataV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","serviceInstanceId","requestId","frame","sampleFormat","payloadBytes"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"audioMetadata"},"serviceInstanceId":{"$ref":"#/$defs/serviceInstanceId"},"requestId":{"$ref":"#/$defs/requestId"},"frame":{"allOf":[{"$ref":"urn:voxleaf:schema:audio-frame:v1"},{"type":"object","properties":{"sequence":{"const":0},"sampleRateHz":{"const":24000},"sampleCountSamples":{"type":"integer","minimum":1,"maximum":480000},"channelCount":{"const":1},"endOfSegment":{"const":true}}}]},"sampleFormat":{"const":"float32-le"},"payloadBytes":{"type":"integer","minimum":4,"maximum":1920000,"multipleOf":4}}};

function validate111(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate111.evaluated;
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
if(data.protocolVersion === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "protocolVersion"},message:"must have required property '"+"protocolVersion"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.kind === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "kind"},message:"must have required property '"+"kind"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.serviceInstanceId === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "serviceInstanceId"},message:"must have required property '"+"serviceInstanceId"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.requestId === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "requestId"},message:"must have required property '"+"requestId"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.frame === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "frame"},message:"must have required property '"+"frame"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data.sampleFormat === undefined){
const err6 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sampleFormat"},message:"must have required property '"+"sampleFormat"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(data.payloadBytes === undefined){
const err7 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "payloadBytes"},message:"must have required property '"+"payloadBytes"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
for(const key0 in data){
if(!((((((((key0 === "schemaVersion") || (key0 === "protocolVersion")) || (key0 === "kind")) || (key0 === "serviceInstanceId")) || (key0 === "requestId")) || (key0 === "frame")) || (key0 === "sampleFormat")) || (key0 === "payloadBytes"))){
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
if(!(validate77(data.schemaVersion, {instancePath:instancePath+"/schemaVersion",parentData:data,parentDataProperty:"schemaVersion",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate77.errors : vErrors.concat(validate77.errors);
errors = vErrors.length;
}
}
if(data.protocolVersion !== undefined){
let data1 = data.protocolVersion;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err9 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(1 !== data1){
const err10 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
if(data.kind !== undefined){
if("audioMetadata" !== data.kind){
const err11 = {instancePath:instancePath+"/kind",schemaPath:"#/properties/kind/const",keyword:"const",params:{allowedValue: "audioMetadata"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(data.serviceInstanceId !== undefined){
let data3 = data.serviceInstanceId;
if(typeof data3 === "string"){
if(func2(data3) > 128){
const err12 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
if(func2(data3) < 1){
const err13 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
if(!pattern4.test(data3)){
const err14 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
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
const err15 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
if(data.requestId !== undefined){
let data4 = data.requestId;
if(typeof data4 === "string"){
if(func2(data4) > 128){
const err16 = {instancePath:instancePath+"/requestId",schemaPath:"#/$defs/requestId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
if(func2(data4) < 1){
const err17 = {instancePath:instancePath+"/requestId",schemaPath:"#/$defs/requestId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
if(!pattern4.test(data4)){
const err18 = {instancePath:instancePath+"/requestId",schemaPath:"#/$defs/requestId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
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
const err19 = {instancePath:instancePath+"/requestId",schemaPath:"#/$defs/requestId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
if(data.frame !== undefined){
let data5 = data.frame;
if(!(validate20(data5, {instancePath:instancePath+"/frame",parentData:data,parentDataProperty:"frame",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate20.errors : vErrors.concat(validate20.errors);
errors = vErrors.length;
}
if(data5 && typeof data5 == "object" && !Array.isArray(data5)){
if(data5.sequence !== undefined){
if(0 !== data5.sequence){
const err20 = {instancePath:instancePath+"/frame/sequence",schemaPath:"#/properties/frame/allOf/1/properties/sequence/const",keyword:"const",params:{allowedValue: 0},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
if(data5.sampleRateHz !== undefined){
if(24000 !== data5.sampleRateHz){
const err21 = {instancePath:instancePath+"/frame/sampleRateHz",schemaPath:"#/properties/frame/allOf/1/properties/sampleRateHz/const",keyword:"const",params:{allowedValue: 24000},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
if(data5.sampleCountSamples !== undefined){
let data8 = data5.sampleCountSamples;
if(!(((typeof data8 == "number") && (!(data8 % 1) && !isNaN(data8))) && (isFinite(data8)))){
const err22 = {instancePath:instancePath+"/frame/sampleCountSamples",schemaPath:"#/properties/frame/allOf/1/properties/sampleCountSamples/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
if((typeof data8 == "number") && (isFinite(data8))){
if(data8 > 480000 || isNaN(data8)){
const err23 = {instancePath:instancePath+"/frame/sampleCountSamples",schemaPath:"#/properties/frame/allOf/1/properties/sampleCountSamples/maximum",keyword:"maximum",params:{comparison: "<=", limit: 480000},message:"must be <= 480000"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
if(data8 < 1 || isNaN(data8)){
const err24 = {instancePath:instancePath+"/frame/sampleCountSamples",schemaPath:"#/properties/frame/allOf/1/properties/sampleCountSamples/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
}
if(data5.channelCount !== undefined){
if(1 !== data5.channelCount){
const err25 = {instancePath:instancePath+"/frame/channelCount",schemaPath:"#/properties/frame/allOf/1/properties/channelCount/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
if(data5.endOfSegment !== undefined){
if(true !== data5.endOfSegment){
const err26 = {instancePath:instancePath+"/frame/endOfSegment",schemaPath:"#/properties/frame/allOf/1/properties/endOfSegment/const",keyword:"const",params:{allowedValue: true},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
}
else {
const err27 = {instancePath:instancePath+"/frame",schemaPath:"#/properties/frame/allOf/1/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
if(data.sampleFormat !== undefined){
if("float32-le" !== data.sampleFormat){
const err28 = {instancePath:instancePath+"/sampleFormat",schemaPath:"#/properties/sampleFormat/const",keyword:"const",params:{allowedValue: "float32-le"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
if(data.payloadBytes !== undefined){
let data12 = data.payloadBytes;
if(!(((typeof data12 == "number") && (!(data12 % 1) && !isNaN(data12))) && (isFinite(data12)))){
const err29 = {instancePath:instancePath+"/payloadBytes",schemaPath:"#/properties/payloadBytes/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
if((typeof data12 == "number") && (isFinite(data12))){
if(data12 > 1920000 || isNaN(data12)){
const err30 = {instancePath:instancePath+"/payloadBytes",schemaPath:"#/properties/payloadBytes/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1920000},message:"must be <= 1920000"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
if(data12 < 4 || isNaN(data12)){
const err31 = {instancePath:instancePath+"/payloadBytes",schemaPath:"#/properties/payloadBytes/minimum",keyword:"minimum",params:{comparison: ">=", limit: 4},message:"must be >= 4"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
let res0;
if((4 === 0 || (res0 = data12/4, res0 !== parseInt(res0)))){
const err32 = {instancePath:instancePath+"/payloadBytes",schemaPath:"#/properties/payloadBytes/multipleOf",keyword:"multipleOf",params:{multipleOf: 4},message:"must be multiple of 4"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
}
}
}
else {
const err33 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
validate111.errors = vErrors;
return errors === 0;
}
validate111.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema188 = {"title":"TtsCompletedV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","serviceInstanceId","workIdentity"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"completed"},"serviceInstanceId":{"$ref":"#/$defs/serviceInstanceId"},"workIdentity":{"$ref":"#/$defs/workIdentity"}}};

function validate115(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate115.evaluated;
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
if(data.protocolVersion === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "protocolVersion"},message:"must have required property '"+"protocolVersion"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.kind === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "kind"},message:"must have required property '"+"kind"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.serviceInstanceId === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "serviceInstanceId"},message:"must have required property '"+"serviceInstanceId"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.workIdentity === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "workIdentity"},message:"must have required property '"+"workIdentity"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
for(const key0 in data){
if(!(((((key0 === "schemaVersion") || (key0 === "protocolVersion")) || (key0 === "kind")) || (key0 === "serviceInstanceId")) || (key0 === "workIdentity"))){
const err5 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.schemaVersion !== undefined){
if(!(validate77(data.schemaVersion, {instancePath:instancePath+"/schemaVersion",parentData:data,parentDataProperty:"schemaVersion",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate77.errors : vErrors.concat(validate77.errors);
errors = vErrors.length;
}
}
if(data.protocolVersion !== undefined){
let data1 = data.protocolVersion;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err6 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(1 !== data1){
const err7 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.kind !== undefined){
if("completed" !== data.kind){
const err8 = {instancePath:instancePath+"/kind",schemaPath:"#/properties/kind/const",keyword:"const",params:{allowedValue: "completed"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data.serviceInstanceId !== undefined){
let data3 = data.serviceInstanceId;
if(typeof data3 === "string"){
if(func2(data3) > 128){
const err9 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(func2(data3) < 1){
const err10 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if(!pattern4.test(data3)){
const err11 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
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
const err12 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data.workIdentity !== undefined){
if(!(validate92(data.workIdentity, {instancePath:instancePath+"/workIdentity",parentData:data,parentDataProperty:"workIdentity",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate92.errors : vErrors.concat(validate92.errors);
errors = vErrors.length;
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
validate115.errors = vErrors;
return errors === 0;
}
validate115.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema191 = {"title":"TtsCancelledV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","serviceInstanceId","workIdentity"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"cancelled"},"serviceInstanceId":{"$ref":"#/$defs/serviceInstanceId"},"workIdentity":{"$ref":"#/$defs/workIdentity"}}};

function validate119(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate119.evaluated;
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
if(data.protocolVersion === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "protocolVersion"},message:"must have required property '"+"protocolVersion"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.kind === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "kind"},message:"must have required property '"+"kind"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.serviceInstanceId === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "serviceInstanceId"},message:"must have required property '"+"serviceInstanceId"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.workIdentity === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "workIdentity"},message:"must have required property '"+"workIdentity"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
for(const key0 in data){
if(!(((((key0 === "schemaVersion") || (key0 === "protocolVersion")) || (key0 === "kind")) || (key0 === "serviceInstanceId")) || (key0 === "workIdentity"))){
const err5 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.schemaVersion !== undefined){
if(!(validate77(data.schemaVersion, {instancePath:instancePath+"/schemaVersion",parentData:data,parentDataProperty:"schemaVersion",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate77.errors : vErrors.concat(validate77.errors);
errors = vErrors.length;
}
}
if(data.protocolVersion !== undefined){
let data1 = data.protocolVersion;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err6 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(1 !== data1){
const err7 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.kind !== undefined){
if("cancelled" !== data.kind){
const err8 = {instancePath:instancePath+"/kind",schemaPath:"#/properties/kind/const",keyword:"const",params:{allowedValue: "cancelled"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data.serviceInstanceId !== undefined){
let data3 = data.serviceInstanceId;
if(typeof data3 === "string"){
if(func2(data3) > 128){
const err9 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(func2(data3) < 1){
const err10 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if(!pattern4.test(data3)){
const err11 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
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
const err12 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data.workIdentity !== undefined){
if(!(validate92(data.workIdentity, {instancePath:instancePath+"/workIdentity",parentData:data,parentDataProperty:"workIdentity",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate92.errors : vErrors.concat(validate92.errors);
errors = vErrors.length;
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
validate119.errors = vErrors;
return errors === 0;
}
validate119.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema194 = {"title":"TtsErrorV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","serviceInstanceId","reason","error"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"error"},"serviceInstanceId":{"$ref":"#/$defs/serviceInstanceId"},"reason":{"$ref":"#/$defs/protocolReason"},"error":{"$ref":"urn:voxleaf:schema:operational-error:v1"},"workIdentity":{"$ref":"#/$defs/workIdentity"}}};
const schema197 = {"type":"string","enum":["malformed-frame","unsupported-protocol-version","unknown-record-kind","invalid-flags","empty-payload","over-limit","invalid-utf8","malformed-json","unknown-message-kind","unsupported-schema-version","invalid-message","invalid-state","identity-mismatch","duplicate-identity","sequence-gap","format-mismatch","busy","engine-failure","engine-timeout","operation-cancelled","resource-exhausted"]};

function validate123(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate123.evaluated;
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
if(data.protocolVersion === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "protocolVersion"},message:"must have required property '"+"protocolVersion"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.kind === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "kind"},message:"must have required property '"+"kind"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.serviceInstanceId === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "serviceInstanceId"},message:"must have required property '"+"serviceInstanceId"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.reason === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "reason"},message:"must have required property '"+"reason"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.error === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "error"},message:"must have required property '"+"error"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
for(const key0 in data){
if(!(((((((key0 === "schemaVersion") || (key0 === "protocolVersion")) || (key0 === "kind")) || (key0 === "serviceInstanceId")) || (key0 === "reason")) || (key0 === "error")) || (key0 === "workIdentity"))){
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
if(!(validate77(data.schemaVersion, {instancePath:instancePath+"/schemaVersion",parentData:data,parentDataProperty:"schemaVersion",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate77.errors : vErrors.concat(validate77.errors);
errors = vErrors.length;
}
}
if(data.protocolVersion !== undefined){
let data1 = data.protocolVersion;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err7 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(1 !== data1){
const err8 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data.kind !== undefined){
if("error" !== data.kind){
const err9 = {instancePath:instancePath+"/kind",schemaPath:"#/properties/kind/const",keyword:"const",params:{allowedValue: "error"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
if(data.serviceInstanceId !== undefined){
let data3 = data.serviceInstanceId;
if(typeof data3 === "string"){
if(func2(data3) > 128){
const err10 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/maxLength",keyword:"maxLength",params:{limit: 128},message:"must NOT have more than 128 characters"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if(func2(data3) < 1){
const err11 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
if(!pattern4.test(data3)){
const err12 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/pattern",keyword:"pattern",params:{pattern: "^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"},message:"must match pattern \""+"^(?!\\s)(?!.*\\s$)[^\\u0000-\\u001F\\u007F]+$"+"\""};
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
const err13 = {instancePath:instancePath+"/serviceInstanceId",schemaPath:"#/$defs/serviceInstanceId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
if(data.reason !== undefined){
let data4 = data.reason;
if(typeof data4 !== "string"){
const err14 = {instancePath:instancePath+"/reason",schemaPath:"#/$defs/protocolReason/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
if(!(((((((((((((((((((((data4 === "malformed-frame") || (data4 === "unsupported-protocol-version")) || (data4 === "unknown-record-kind")) || (data4 === "invalid-flags")) || (data4 === "empty-payload")) || (data4 === "over-limit")) || (data4 === "invalid-utf8")) || (data4 === "malformed-json")) || (data4 === "unknown-message-kind")) || (data4 === "unsupported-schema-version")) || (data4 === "invalid-message")) || (data4 === "invalid-state")) || (data4 === "identity-mismatch")) || (data4 === "duplicate-identity")) || (data4 === "sequence-gap")) || (data4 === "format-mismatch")) || (data4 === "busy")) || (data4 === "engine-failure")) || (data4 === "engine-timeout")) || (data4 === "operation-cancelled")) || (data4 === "resource-exhausted"))){
const err15 = {instancePath:instancePath+"/reason",schemaPath:"#/$defs/protocolReason/enum",keyword:"enum",params:{allowedValues: schema197.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
if(data.error !== undefined){
if(!(validate65(data.error, {instancePath:instancePath+"/error",parentData:data,parentDataProperty:"error",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate65.errors : vErrors.concat(validate65.errors);
errors = vErrors.length;
}
}
if(data.workIdentity !== undefined){
if(!(validate92(data.workIdentity, {instancePath:instancePath+"/workIdentity",parentData:data,parentDataProperty:"workIdentity",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate92.errors : vErrors.concat(validate92.errors);
errors = vErrors.length;
}
}
}
else {
const err16 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
validate123.errors = vErrors;
return errors === 0;
}
validate123.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema198 = {"title":"TtsProtocolRejectedV1Wire","type":"object","additionalProperties":false,"required":["schemaVersion","protocolVersion","kind","reason"],"properties":{"schemaVersion":{"$ref":"#/$defs/schemaVersion"},"protocolVersion":{"$ref":"#/$defs/protocolVersion"},"kind":{"const":"protocolRejected"},"reason":{"$ref":"#/$defs/protocolReason"}}};

function validate128(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate128.evaluated;
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
if(data.protocolVersion === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "protocolVersion"},message:"must have required property '"+"protocolVersion"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.kind === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "kind"},message:"must have required property '"+"kind"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.reason === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "reason"},message:"must have required property '"+"reason"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
for(const key0 in data){
if(!((((key0 === "schemaVersion") || (key0 === "protocolVersion")) || (key0 === "kind")) || (key0 === "reason"))){
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
if(!(validate77(data.schemaVersion, {instancePath:instancePath+"/schemaVersion",parentData:data,parentDataProperty:"schemaVersion",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate77.errors : vErrors.concat(validate77.errors);
errors = vErrors.length;
}
}
if(data.protocolVersion !== undefined){
let data1 = data.protocolVersion;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err5 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(1 !== data1){
const err6 = {instancePath:instancePath+"/protocolVersion",schemaPath:"#/$defs/protocolVersion/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data.kind !== undefined){
if("protocolRejected" !== data.kind){
const err7 = {instancePath:instancePath+"/kind",schemaPath:"#/properties/kind/const",keyword:"const",params:{allowedValue: "protocolRejected"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.reason !== undefined){
let data3 = data.reason;
if(typeof data3 !== "string"){
const err8 = {instancePath:instancePath+"/reason",schemaPath:"#/$defs/protocolReason/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(!(((((((((((((((((((((data3 === "malformed-frame") || (data3 === "unsupported-protocol-version")) || (data3 === "unknown-record-kind")) || (data3 === "invalid-flags")) || (data3 === "empty-payload")) || (data3 === "over-limit")) || (data3 === "invalid-utf8")) || (data3 === "malformed-json")) || (data3 === "unknown-message-kind")) || (data3 === "unsupported-schema-version")) || (data3 === "invalid-message")) || (data3 === "invalid-state")) || (data3 === "identity-mismatch")) || (data3 === "duplicate-identity")) || (data3 === "sequence-gap")) || (data3 === "format-mismatch")) || (data3 === "busy")) || (data3 === "engine-failure")) || (data3 === "engine-timeout")) || (data3 === "operation-cancelled")) || (data3 === "resource-exhausted"))){
const err9 = {instancePath:instancePath+"/reason",schemaPath:"#/$defs/protocolReason/enum",keyword:"enum",params:{allowedValues: schema197.enum},message:"must be equal to one of the allowed values"};
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
else {
const err10 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
validate128.errors = vErrors;
return errors === 0;
}
validate128.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate75(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="urn:voxleaf:schema:tts-protocol-control:v1" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate75.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
const _errs0 = errors;
let valid0 = false;
let passing0 = null;
const _errs1 = errors;
if(!(validate76(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate76.errors : vErrors.concat(validate76.errors);
errors = vErrors.length;
}
var _valid0 = _errs1 === errors;
if(_valid0){
valid0 = true;
passing0 = 0;
var props0 = true;
}
const _errs2 = errors;
if(!(validate80(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate80.errors : vErrors.concat(validate80.errors);
errors = vErrors.length;
}
var _valid0 = _errs2 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 1];
}
else {
if(_valid0){
valid0 = true;
passing0 = 1;
if(props0 !== true){
props0 = true;
}
}
const _errs3 = errors;
if(!(validate83(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate83.errors : vErrors.concat(validate83.errors);
errors = vErrors.length;
}
var _valid0 = _errs3 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 2];
}
else {
if(_valid0){
valid0 = true;
passing0 = 2;
if(props0 !== true){
props0 = true;
}
}
const _errs4 = errors;
if(!(validate86(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate86.errors : vErrors.concat(validate86.errors);
errors = vErrors.length;
}
var _valid0 = _errs4 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 3];
}
else {
if(_valid0){
valid0 = true;
passing0 = 3;
if(props0 !== true){
props0 = true;
}
}
const _errs5 = errors;
if(!(validate90(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate90.errors : vErrors.concat(validate90.errors);
errors = vErrors.length;
}
var _valid0 = _errs5 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 4];
}
else {
if(_valid0){
valid0 = true;
passing0 = 4;
if(props0 !== true){
props0 = true;
}
}
const _errs6 = errors;
if(!(validate95(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate95.errors : vErrors.concat(validate95.errors);
errors = vErrors.length;
}
var _valid0 = _errs6 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 5];
}
else {
if(_valid0){
valid0 = true;
passing0 = 5;
if(props0 !== true){
props0 = true;
}
}
const _errs7 = errors;
if(!(validate98(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate98.errors : vErrors.concat(validate98.errors);
errors = vErrors.length;
}
var _valid0 = _errs7 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 6];
}
else {
if(_valid0){
valid0 = true;
passing0 = 6;
if(props0 !== true){
props0 = true;
}
}
const _errs8 = errors;
if(!(validate101(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate101.errors : vErrors.concat(validate101.errors);
errors = vErrors.length;
}
var _valid0 = _errs8 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 7];
}
else {
if(_valid0){
valid0 = true;
passing0 = 7;
if(props0 !== true){
props0 = true;
}
}
const _errs9 = errors;
if(!(validate104(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate104.errors : vErrors.concat(validate104.errors);
errors = vErrors.length;
}
var _valid0 = _errs9 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 8];
}
else {
if(_valid0){
valid0 = true;
passing0 = 8;
if(props0 !== true){
props0 = true;
}
}
const _errs10 = errors;
if(!(validate107(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate107.errors : vErrors.concat(validate107.errors);
errors = vErrors.length;
}
var _valid0 = _errs10 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 9];
}
else {
if(_valid0){
valid0 = true;
passing0 = 9;
if(props0 !== true){
props0 = true;
}
}
const _errs11 = errors;
if(!(validate111(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate111.errors : vErrors.concat(validate111.errors);
errors = vErrors.length;
}
var _valid0 = _errs11 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 10];
}
else {
if(_valid0){
valid0 = true;
passing0 = 10;
if(props0 !== true){
props0 = true;
}
}
const _errs12 = errors;
if(!(validate115(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate115.errors : vErrors.concat(validate115.errors);
errors = vErrors.length;
}
var _valid0 = _errs12 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 11];
}
else {
if(_valid0){
valid0 = true;
passing0 = 11;
if(props0 !== true){
props0 = true;
}
}
const _errs13 = errors;
if(!(validate119(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate119.errors : vErrors.concat(validate119.errors);
errors = vErrors.length;
}
var _valid0 = _errs13 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 12];
}
else {
if(_valid0){
valid0 = true;
passing0 = 12;
if(props0 !== true){
props0 = true;
}
}
const _errs14 = errors;
if(!(validate123(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate123.errors : vErrors.concat(validate123.errors);
errors = vErrors.length;
}
var _valid0 = _errs14 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 13];
}
else {
if(_valid0){
valid0 = true;
passing0 = 13;
if(props0 !== true){
props0 = true;
}
}
const _errs15 = errors;
if(!(validate128(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate128.errors : vErrors.concat(validate128.errors);
errors = vErrors.length;
}
var _valid0 = _errs15 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 14];
}
else {
if(_valid0){
valid0 = true;
passing0 = 14;
if(props0 !== true){
props0 = true;
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
if(!valid0){
const err0 = {instancePath,schemaPath:"#/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
else {
errors = _errs0;
if(vErrors !== null){
if(_errs0){
vErrors.length = _errs0;
}
else {
vErrors = null;
}
}
}
validate75.errors = vErrors;
evaluated0.props = props0;
return errors === 0;
}
validate75.evaluated = {"dynamicProps":true,"dynamicItems":false};
