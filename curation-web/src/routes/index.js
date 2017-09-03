import CoreLayout from '../layouts/CoreLayout';
import UnAuthLayout from '../layouts/UnAuthLayout';
import Home from './Home';
import Login from './Login';
import UsersList from './UsersList';
import { PageNotFound, UnAuthorize } from './PageNotFound';
import ResetPassword from './ResetPassword';
import Authentication from 'containers/Authentication';
import ChartReview from './ChartReview';
import CaseReportForm from './CaseReportForm';
import Questions from './QuestionList';
import Projects from './Projects';
import SearchPatient from './SearchPatient';
import EmailTemplateDesigner from './EmailTemplateDesigner';

import Users from './Users';
import Settings from './AdminSettings';

const CURATOR = ['curator']
const ADMIN = ['admin']
const ALLOW_ALL = ['curator', 'admin']

export const createRoutes = (store) => ([{
  path: '/',
  component: Authentication(CoreLayout, ADMIN),
  indexRoute: Home(store),
  childRoutes: [
    UsersList(store),
    CaseReportForm(store),
    Projects(store),
    Questions(store),
    Settings(store),
    
    EmailTemplateDesigner(store)
  ]
},
{
  path: '/',
  component: Authentication(CoreLayout, CURATOR),
  indexRoute :Home(store), 
  childRoutes: [
  ]
},
{
  path: '/',
  component: Authentication(CoreLayout, ALLOW_ALL),
  indexRoute :Home(store), 
  childRoutes: [
    Users(store),
    ChartReview(store),
    SearchPatient(store) 
  ]
},
{
  path: '/',
  component: UnAuthLayout,
  childRoutes: [
    Login(store),
    ResetPassword(store)
  ]
},
{
  path : '/unauthorized',
  component: Authentication(CoreLayout),
  indexRoute : UnAuthorize
},
{
  path : '*',
  component: PageNotFound
}
]
)
export default createRoutes
