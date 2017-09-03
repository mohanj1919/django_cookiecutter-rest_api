import React from 'react';
import {default as UsersList} from '../../../src/routes/UsersList/components/UsersList';
import { mount } from 'enzyme';
import expect from 'expect';
import sinon from 'sinon';
import usrs from './users.json';
import result from './result.json';

describe('UsersList Component', () => {
    beforeEach(function() {
        localStorage.logged_user_role = 'admin'
    });
    let usr=usrs;
    let res=result;
    let seq=["First Name","Last Name","Email","Mobile number","Role","Status","MFA type"];
    let wrapper=mount(<UsersList
        fetchUsers={function(){}}
        users={usr}
        //PageChange={function(){}}
        selectedObject={usr[0]}
    />)
    describe("Users layout",()=>{

        it("Should render outer layout of user table",()=>{
            expect(wrapper.find('.users-list')).toExist
        })
    })
    describe("Users table",()=>{
        it('Should render user table',()=>{
            expect(wrapper.find('.users-list').find('.users-table')).toExist
        })
        it('Should render user table body ',()=>{
            expect(wrapper.find('.users-list').find('tbody')).toExist
        })
        it('Should render user table header',()=>{
            expect(wrapper.find('.users-list').find('thead')).toExist
        })
    })    
    describe('Users table header columns',()=>{
        wrapper.find('.users-list').find('thead tr th').forEach((item,i)=>{
            let elem=item;            
        if(item.text()!="Actions"){
           it("Should render "+seq[i],()=>{
               expect(item).toExist;
            })
            it("Should render exact value of "+seq[i],()=>{ 
                expect(item.text()).toEqual(seq[i]);
            })
        }
        else{
            it("Should render Actions",()=>{
                expect(item).toExist;
            })
            it("Should render exact value of Actions",()=>
            {
                expect(item.text()).toEqual("Actions")
            })
        }
        })
    })
    describe('Users details',()=>{                

        wrapper.find('.users-list').find('tbody tr').forEach((item,i)=>
        {
            let elem=item;
            let result=res[i];
            elem.find('td span').forEach((itm,j)=>{
                it("Should render "+seq[j],()=>{
                    expect(itm).toExist;    
                })
                it("Should have exact Value of "+seq[j],()=>{
                    expect(itm.text()).toEqual(result[seq[j]])                    
                })
            })
        })
    })
})