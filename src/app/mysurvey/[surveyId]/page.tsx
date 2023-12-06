'use client'

import { sendGraphQLQuery } from '@/graphql/Problem/createProblem';
import { mapQuestionsToProblems } from '@/graphql/Problem/getProblems';
import { getGraphQLQuery } from '@/graphql/Survey/getMySurvey';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';

interface Survey {
  s_id: string;
  title: string;
  description: string;
  user: string;
}

export default function Home({ params }: {
  params: { surveyId:string}
}) {
  const [mySurveys, setMySurveys] = useState<Survey[]>([]);
  const [problems, setProblems] = useState([{ id: 1, title: '', options: [{ id: 1, text: '' }] }]);

  const surveyId = params.surveyId;


  const addProblem = () => {
    const newProblem = { id: problems.length + 1, title: '', options: [{ id: 1, text: '' }] };
    setProblems([...problems, newProblem]);
  };

  const removeProblem = (problemIndex: number) => {
    const updatedProblems = [...problems];
    updatedProblems.splice(problemIndex, 1);
    setProblems(updatedProblems);
  };


  const addOption = (problemIndex: number, optionIndex: number) => {
    const newOption = { id: problems[problemIndex].options.length + 1, text: '' };
    const updatedOptions = [...problems[problemIndex].options, newOption];
    const updatedProblems = [...problems];
    updatedProblems[problemIndex].options = updatedOptions;
    setProblems(updatedProblems);
  };

  const removeOption = (problemIndex: number, optionIndex: number) => {
    const updatedOptions = [...problems[problemIndex].options];
    updatedOptions.splice(optionIndex, 1);

    const updatedProblems = [...problems];
    updatedProblems[problemIndex].options = updatedOptions;

    setProblems(updatedProblems);
  };

  const getMyWhichSurvey = async () => {
      const query = `
        query GetMySurvey {
          getMySurvey {
            s_id
            title
            description
            user
          }
        }
      `;
      try {
        const result = await getGraphQLQuery({ query });
        const mySurveysData = result.data.getMySurvey || [];
        setMySurveys(mySurveysData);
      } catch (error) {
        console.error(`나의 ${surveyId}설문지 가져오기 실패:`, error);
      }
  };

  const createQuestion = async (surveyId: string) => {
    const mutation = `
      mutation CreateQuestion($surveyId: String!) {
        createQuestion(surveyId: $surveyId) {
          q_id
        }
      }
    `;
    const variables = {
      surveyId: surveyId,
    };
    getQuestions(surveyId);
    try {
      const result = await sendGraphQLQuery(mutation, variables);
      if (result.data.createQuestion) {
      }
    } catch (error) {
      console.error('Question creation failed:', error);
    }
  };

  const getQuestions = async (surveyId: string) => {
    const query = `
      query GetQuestions($surveyId: String!) {
        getQuestions(surveyId: $surveyId) {
          q_id
          text
          options {
            o_id
            text
          }
        }
      }
    `;

    const variables = {
      surveyId: surveyId,
    };

    try {
      const result = await sendGraphQLQuery(query, variables);
      const questions = result.data.getQuestions;

      // Assuming you have a function to map GraphQL response to the required format
      const mappedQuestions = mapQuestionsToProblems(questions);

      // Assuming you have a state setter function to set the problems array
      setProblems(await mappedQuestions);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  };


  useEffect(() => {
    getQuestions(surveyId)
  })

  return (
    <main className='flex-col w-full h-full p-[30px] pt-[60px]'>
      <section className='w-full h-[80px]  flex items-center justify-end pr-[50px]'>
        <button className='w-[80px] p-[5px] rounded-md shadow-md bg-slate-200 hover:bg-blue-400'>Save</button>
        <button className='w-[80px] p-[5px] rounded-md shadow-md ml-[20px] bg-slate-200 hover:bg-blue-400'>Puplic</button>
      </section>
      <section className='titleSection w-full h-[200px]  flex items-center justify-center '>
        <div className='titleDiv w-[500px]  flex-col items-center justify-center'>
          <input
            type="text"
            placeholder={`설문지 제목을 적어주세요.`}
            className='text-center text-[30px] w-full font-bold'
          />
        </div>
      </section>
      <section className='descriptoionSection w-full h-full  flex items-center justify-center mb-[120px]'>
        <div className='descriptoionDiv w-[800px] h-[130px] shadow-sm shadow-slate-400 rounded-md p-[30px] cursor-pointer'>
          <input type='text' placeholder='설문지를 설명해주세요.' className='w-full h-full bg-transparent border-none'/>
        </div>
      </section>
      <section className='problemSection w-full min-h-[400px]  '>
        {problems.length > 0 && (
          <ul className='problemUl flex-col list-decimal  pl-[30px]'>
            {problems.map((problem, problemIndex) => (
              <li key={problem.id} className='mb-[30px] ml-[30px]'>
                <button
                  onClick={() => removeProblem(problemIndex)}
                  className='bg-red-600 flex items-center justify-center absolute w-[30px] h-[30px] rounded-full translate-x-[-60px] translate-y-[-4px] hover:bg-slate-400 transition-all'
                >
                  <span className='text-white text-[40px]'>-</span>
                </button>
                <input
                  type="text"
                  placeholder={`문제 ${problemIndex + 1} 제목을 입력해주세요`}
                  className='ml-[10px] pl-[10px] w-[500px]'
                />
                <div className='flex mt-[20px]'>
                  {problem.options.map((option, optionIndex) => (
                    <div
                      key={option.id}
                      className='mr-[30px] px-[20px] py-[10px] shadow-sm shadow-slate-400 rounded-sm transition-all flex items-center'
                    >
                      <div className='bg-slate-300 flex items-center justify-center w-[23px] h-[23px] rounded-full mr-[10px]'>
                        <span>{option.id}</span>
                      </div>
                      <input type='text' placeholder='문항을 입력하세요.' className='bg-transparent' />
                      <input type='number' placeholder='점수를 입력하세요.' className='bg-transparent' />
                      <button
                        className='w-[50px] text-[20px] h-full rounded-sm shadow-sm hover:bg-red-600 hover:text-white'
                        onClick={() => removeOption(problemIndex, optionIndex)}
                      >
                        <FontAwesomeIcon icon={faTrash} className='text-[20px]'/>
                      </button>
                    </div>

                  ))}
                  <button
                    className='mr-[30px] p-[10px] w-[50px] h-[50px] shadow-sm shadow-slate-400 rounded-sm hover:bg-slate-400 transition-all'
                    onClick={() => addOption(problemIndex, problem.options.length)}
                  >
                    <span>+</span>
                  </button>
                </div>
              
              </li>
            ))}
          </ul>)}
        <div className='problemPlusDiv mt-[30px]'>
          <button
            className='w-full py-[10px] rounded-md shadow-sm shadow-slate-400 hover:bg-slate-400 transition-all'
            onClick={()=>createQuestion(surveyId)}
          >
            문항 추가하기 +
          </button>
        </div>
      </section>
    </main>
  );
}
