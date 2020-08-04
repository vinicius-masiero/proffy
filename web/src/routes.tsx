import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import TeacherList from './pages/TeacherList';
import TeacherForm from './pages/TeacherForm';

function Routes() {
  return (
    <BrowserRouter>
      <Route path="/proffy" exact component={Landing} />
      <Route path="/proffy/study" component={TeacherList} />
      <Route path="/proffy/give-classes" component={TeacherForm} />
    </BrowserRouter>
  )
}

export default Routes;