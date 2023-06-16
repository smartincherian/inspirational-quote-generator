import React, { useEffect, useState } from "react";

import Head from "next/head";

//components
import {
  BackgroundImage1,
  BackgroundImage2,
  FooterCon,
  FooterLink,
  GenerateQuoteButton,
  GenerateQuotesButtonText,
  GradientBackgroundCon,
  QuoteGeneratorCon,
  QuoteGeneratorInnerCon,
  QuoteGeneratorSubTitle,
  QuoteGeneratorTitle,
  RedSpan,
} from "../components/QuoteGenerator/QuoteGenerator";

//assets
import Clouds1 from "../assets/cloud-and-thunder.png";
import Clouds2 from "../assets/cloudy-weather.png";
import { API } from "aws-amplify";
import { generateAQuote, quoteQueryName } from "../src/graphql/queries";
import { GraphQLResult } from "@aws-amplify/api-graphql";

import QuoteGeneratorModal from "../components/QuoteGenerator/index";

function index() {
  const [numberOfQuotes, setnumberOfQuotes] = useState<Number | null>(0);
  const [openGenerator, setOpenGenerator] = useState(false);
  const [processingQuote, setProcessingQuote] = useState(false);
  const [quoteReceived, setQuoteReceived] = useState<String | null>(null);

  //interface for our appsync <> lamba JSON response

  interface GenerateAQuoteData {
    generateAQuote: {
      statusCode: number;
      headers: { [key: string]: string };
      body: string;
    };
  }

  //interface for our DynamoDB object

  interface UpdateQuoteInfoData {
    id: string;
    queryName: string;
    quotesGenerated: number;
    createdAt: string;
    updatedAt: string;
  }

  //type guard for our fetch function
  function isGraphQLResultForquotesQueryName(
    response: any
  ): response is GraphQLResult<{
    quoteQueryName: {
      items: [UpdateQuoteInfoData];
    };
  }> {
    return (
      response.data &&
      response.data.quoteQueryName &&
      response.data.quoteQueryName.items
    );
  }

  //Functions for quote generator modal

  const handleCloseGenerator = () => {
    setOpenGenerator(false);
    setProcessingQuote(false);
    setQuoteReceived(null);
  };

  const handleOpenGenerator = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setOpenGenerator(true);
    setProcessingQuote(true);
    try {
      //Run lamba function
      // setTimeout(() => {
      //   setProcessingQuote(false);
      // }, 3000);

      const runFunction = "runFunction";
      const runFunctionStringified = JSON.stringify(runFunction);
      const response = await API.graphql<GenerateAQuoteData>({
        query: generateAQuote,
        authMode: "AWS_IAM",
        variables: {
          input: runFunctionStringified,
        },
      });

      const responseStringified = JSON.stringify(response);
      const responseReStringified = JSON.stringify(responseStringified);
      const bodyIndex = responseReStringified.indexOf("body=") + 5;
      const bodyAndBase64 = responseReStringified.substring(bodyIndex);
      const bodyArray = bodyAndBase64.split(",");
      const body = bodyArray[0];
      console.log(body);
      setQuoteReceived(body);

      //End State
      setProcessingQuote(false);

      //Fetch if any new quotes were generated from counter

      updateQuoteInfo();
    } catch (err) {
      console.log("error generating quote", err);
      setProcessingQuote(false);
    }
  };

  // Function to fetch our DynamoDB object (quotes generated)

  const updateQuoteInfo = async () => {
    try {
      const response = await API.graphql<UpdateQuoteInfoData>({
        query: quoteQueryName,
        authMode: "AWS_IAM",
        variables: {
          queryName: "LIVE",
        },
      });
      console.log("response", response);
      // Create type guards
      if (!isGraphQLResultForquotesQueryName(response)) {
        throw new Error("Unexpected response from API.graphql");
      }

      if (!response.data) {
        throw new Error("Response data is undefined");
      }

      const receivedNumberOfQuotes =
        response.data.quoteQueryName.items[0].quotesGenerated;
      setnumberOfQuotes(receivedNumberOfQuotes);
    } catch (err) {
      console.log("error getting quote data", err);
    }
  };

  useEffect(() => {
    updateQuoteInfo();
  }, []);

  return (
    <>
      <Head>
        <title>Inspirational Quote Generator</title>
        <meta name="description" content="A fun project to generate quotes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* Background */}
      <GradientBackgroundCon>
        {/* Quote Generator Modal Pop-up*/}
        <QuoteGeneratorModal
          open={openGenerator}
          close={handleCloseGenerator}
          processingQuote={processingQuote}
          setProcessingQuote={setProcessingQuote}
          quoteReceived={quoteReceived}
          setQuoteReceived={setQuoteReceived}
        />

        {/* Quote Generator */}
        <QuoteGeneratorCon>
          <QuoteGeneratorInnerCon>
            <QuoteGeneratorTitle>
              Daily Inspiration Generator
            </QuoteGeneratorTitle>

            <QuoteGeneratorSubTitle>
              Looking for a splash of inspiration? Generate a quote card with a
              random inspirational quote provided by{" "}
              <FooterLink
                href="https://zenquotes.io"
                target="_blank"
                rel="noopener noreferrer"
              >
                ZenQuotes API
              </FooterLink>
            </QuoteGeneratorSubTitle>

            <GenerateQuoteButton onClick={handleOpenGenerator}>
              <GenerateQuotesButtonText>Make a Quote</GenerateQuotesButtonText>
            </GenerateQuoteButton>
          </QuoteGeneratorInnerCon>
        </QuoteGeneratorCon>
        {/* Background Images  */}
        <BackgroundImage1 src={Clouds1} height="300" alt="cloudybackground1" />

        <BackgroundImage2 src={Clouds2} height="300" alt=" cloudybackground1" />

        {/* Footer  */}
        <FooterCon>
          <>
            Quotes Generated : {numberOfQuotes}
            <br />
            Developed with <RedSpan>♥</RedSpan>by
            <FooterLink href="" target="_blank" rel="noopener noreferer">
              @SmartinKCherian
            </FooterLink>
          </>
        </FooterCon>
      </GradientBackgroundCon>
    </>
  );
}

export default index;
