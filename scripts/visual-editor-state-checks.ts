import assert from 'node:assert/strict';
import {visualForm,visualFormErrors,sameVisualForm,sameVisualEntry,type VisualRow}from'../src/lib/visual-editor-state';
const empty:VisualRow={key:'hero',draft:null,live:null},base=visualForm(empty);
assert.ok(!base.id&&base.alt&&base.caption);assert.deepEqual(visualFormErrors(base,'hero'),{});assert.equal(sameVisualForm(base,visualForm(empty)),true);
assert.equal(sameVisualForm({...base,alt:base.alt+' mới'},base),false);assert.equal(sameVisualForm({...base,caption:base.caption+' mới'},base),false);assert.equal(sameVisualForm({...base,id:'library-image'},base),false);assert.equal(sameVisualForm({...base,alt:' '+base.alt+' '},base),true);
assert.ok(visualFormErrors({...base,alt:'x'},'hero').alt);assert.ok(visualFormErrors({...base,caption:''},'hero').caption);assert.ok(visualFormErrors({...base,origin:'AI'},'menu-screen').origin);
const entry={version:1,title:'Mô tả ảnh',summary:'Chú thích ảnh',featuredMediaId:'image',data:{origin:'PHOTO'}};
assert.ok(sameVisualEntry(entry,{...entry,version:2}));assert.ok(!sameVisualEntry(entry,{...entry,summary:'Chú thích mới'}));assert.ok(!sameVisualEntry(entry,null));
console.log('PASS: default baseline, dirty metadata/media, trimmed comparison, field validation and draft/live comparison.');
