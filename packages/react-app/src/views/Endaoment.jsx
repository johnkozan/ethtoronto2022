import { useContractReader, useContractLoader } from "eth-hooks";
import { ethers } from "ethers";
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLongLeftIcon,
  CheckIcon,
  HandThumbUpIcon,
  UserIcon,
} from '@heroicons/react/24/solid';
import { Blockie } from "../components";
import { classNames, blockExplorerLink } from "../helpers";

import VAULTABI from "../contracts/ABI/EndaomentVault.json";

function Endaoment({ readContracts, address, tx, writeContracts, localProvider, localChainId, userSigner, loadWeb3Modal, web3Modal, blockExplorer, targetNetwork }) {
  const { vaultAddress } = useParams();
  const [loaded, setLoaded] = useState(false);

  const contractConfig = {
    deployedContracts: {},
    externalContracts: {
      [localChainId]: {
        contracts: {
          EndaomentVault: {
            address: ethers.utils.isAddress(vaultAddress) ? vaultAddress : ethers.constants.AddressZero,
            abi: VAULTABI,
          },
        },
      },
    },
  };

  const vaultContract = useContractLoader(localProvider, contractConfig);
  const vaultWriter = useContractLoader(userSigner, contractConfig, localChainId);
  const beneficiary = useContractReader(vaultContract, 'EndaomentVault', 'beneficiary');
  const endaomentPrincipalBalance = useContractReader(vaultContract, 'EndaomentVault', 'totalSupply');
  const endaomentTotalBalance = useContractReader(vaultContract, 'EndaomentVault', 'balance');
  const endaomentName = useContractReader(vaultContract, 'EndaomentVault', 'name');
  const currency = useContractReader(vaultContract, 'EndaomentVault', 'want');
  const myBalance = useContractReader(vaultContract, 'EndaomentVault', 'balanceOf', [ address ])

  const myCurrencyBalance = useContractReader(readContracts, 'MockERC20', 'balanceOf', [ address ])
  const myApproval = useContractReader(readContracts, 'MockERC20', 'allowance', [ address, vaultAddress ]);

  const availableToWithdraw = (!!endaomentTotalBalance && !!endaomentPrincipalBalance) ? endaomentTotalBalance.sub(endaomentPrincipalBalance) : undefined;

  const [depositAmount, setDepositAmount] = useState();
  const [withdrawAmount, setWithdrawAmount] = useState();

  const depositAmountValid = depositAmount && myCurrencyBalance && ethers.utils.parseEther(depositAmount).lte(myCurrencyBalance);
  const withdrawAmountValid = withdrawAmount && myBalance && ethers.utils.parseEther(withdrawAmount).lte(myBalance);

  const ownerDetails = (
    <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
      <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">You are the beneficiary of this Vault</h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Balance including interest</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{ endaomentTotalBalance ? ethers.utils.formatEther(endaomentTotalBalance) : '...' }</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Less: princial balances</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{ endaomentPrincipalBalance ? ethers.utils.formatEther(endaomentPrincipalBalance) : '...' }</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Available to withdraw</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{ availableToWithdraw ? ethers.utils.formatEther(availableToWithdraw) : '...' }</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500"></dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">

                  <button
                    type="button"
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={async () => {
                      await tx(vaultWriter.EndaomentVault.withdrawInterest());
                    }}
                  >
                    Withdraw interest to Beneficiary
                  </button>

                </dd>
              </div>
            </dl>
          </div>

        </div>
      </dl>
    </div>
  );

  const depositWithdraw = (
    <>
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <div>
              <div className="flex justify-between">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Deposit DAI
                </label>
                <span className="text-sm text-gray-500" id="email-optional">
                  Balance: { myCurrencyBalance ? ethers.utils.formatEther(myCurrencyBalance) : '...' }
                </span>
              </div>

              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="justify-center mt-4 flex">
                  <input
                    type="text"
                    name="depositAmount"
                    id="depositAmount"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0.00"
                    aria-describedby="price-currency"
                    onChange={e => {
                      setDepositAmount(e.target.value);
                    }}
                    value={depositAmount}
                  />
                  <button
                    type="button"
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={!depositAmountValid}
                    onClick={async () => {
                      if (myApproval.lt(ethers.utils.parseEther(depositAmount))) {
                        await tx(writeContracts.MockERC20.approve(vaultAddress, ethers.utils.parseEther(depositAmount)));
                      }
                      await tx(vaultWriter.EndaomentVault.deposit(ethers.utils.parseEther(depositAmount)));
                      setDepositAmount('');
                    }}
                  >
                    Deposit
                  </button>

                </div>
              </div>
            </div>
          </div>

          <div className="sm:col-span-1">
            <div>
              <div className="flex justify-between">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Withdraw DAI
                </label>
                <span className="text-sm text-gray-500" id="email-optional">
                  Balance: {myBalance ? ethers.utils.formatEther(myBalance) : "..."}
                </span>
              </div>

              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="justify-center mt-4 flex">
                  <input
                    type="text"
                    name="withdrawAmount"
                    id="withdrawAmount"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0.00"
                    aria-describedby="price-currency"
                    onChange={e => {
                      setWithdrawAmount(e.target.value);
                    }}
                    value={withdrawAmount}
                  />
                  <button
                    type="button"
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={async () => {
                      await tx(vaultWriter.EndaomentVault.withdraw(ethers.utils.parseEther(withdrawAmount)));
                      setWithdrawAmount('');
                    }}
                    disabled={!withdrawAmountValid}

                  >
                    Withdraw
                  </button>

                </div>
              </div>
            </div>
          </div>
        </dl>
      </div>
    </>
  );

  const eventTypes = {
    applied: { icon: UserIcon, bgColorClass: "bg-gray-400" },
    advanced: { icon: HandThumbUpIcon, bgColorClass: "bg-blue-500" },
    completed: { icon: CheckIcon, bgColorClass: "bg-green-500" },
  }

  const timeline = [
    {
      id: 1,
      content: "Entry into monthly jackpot prize",
      amount: "0",
    },
    {
      id: 2,
      content: "Unlock exclusive NFT",
      amount: "10",
    },
    {
      id: 3,
      content: "Unlock custom content",
      amount: "25",
    },
  ]

  if (!beneficiary) {
    return (
      <div className="min-h-full pt-16 pb-12 flex flex-col bg-white">
        <main className="flex-grow flex flex-col justify-center max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-16">
            <div className="text-center">
              <p className="text-base font-semibold text-indigo-600">404</p>
              <h1 className="mt-2 text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl">Vault not found.</h1>
              <p className="mt-2 text-base text-gray-500">Sorry, we couldn’t find the vault you’re looking for.</p>
              <div className="mt-6">
                <Link to="/" className="text-base font-medium text-indigo-600 hover:text-indigo-500">
                  Go back<span aria-hidden="true"> &rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const connectWallet = (
    <div className="min-h-full pt-2 pb-2 flex flex-col bg-white">
      <main className="flex-grow flex flex-col justify-center max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-2">
          <button
            type="button"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={loadWeb3Modal}
          >
            Connect your wallet to stake
          </button>
        </div>
      </main>
    </div>
  );

  return (
    <>
      <div className="min-h-full">

        <main className="py-10">
          {/* Page header */}
          <div className="max-w-3xl mx-auto px-4 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">
            <div className="flex items-center space-x-5">
              <div className="flex-shrink-0">
                <div className="relative">
                  <Blockie size={18} address={vaultAddress} className="h-16 w-16 rounded-full" alt={vaultAddress} />
                  <span className="absolute inset-0 shadow-inner rounded-full" aria-hidden="true" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{ endaomentName }</h1>
                <p className="text-sm font-medium text-gray-500">
                  <a href={blockExplorerLink(vaultAddress, blockExplorer)} target="_blank" rel="norefer noopener">{ vaultAddress }</a>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 max-w-3xl mx-auto grid grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
            <div className="space-y-6 lg:col-start-1 lg:col-span-2">
              {/* Description list*/}
              <section aria-labelledby="applicant-information-title">
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h2 id="applicant-information-title" className="text-lg leading-6 font-medium text-gray-900">
                      Description
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Network</dt>
                        <dd className="mt-1 text-sm text-gray-900">{ targetNetwork.name }</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Staking Currency</dt>
                        <dd className="mt-1 text-sm text-gray-900">DAI</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Staker count</dt>
                        <dd className="mt-1 text-sm text-gray-900">X</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Staked Vault</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          { endaomentPrincipalBalance ? ethers.utils.formatEther(endaomentPrincipalBalance) : '...' }
                        </dd>
                      </div>
                    </dl>
                  </div>

                  { address ? depositWithdraw : connectWallet }

                  { beneficiary == address ? ownerDetails : null }
                </div>
              </section>

            </div>

            <section aria-labelledby="timeline-title" className="lg:col-start-3 lg:col-span-1">
              <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">
                <h2 id="timeline-title" className="text-lg font-medium text-gray-900">
                  Staker Rewards
                </h2>

                {/* Activity Feed */}
                <div className="mt-6 flow-root">
                  <ul role="list" className="-mb-8">
                    {timeline.map((item, itemIdx) => (

                      <li key={item.id}>
                        <div className="relative pb-8">
                          {itemIdx !== timeline.length - 1 ? (
                            <span
                              className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span
                                className={classNames(
                                  myBalance && myBalance.gt(ethers.utils.parseEther(item.amount)) ? eventTypes.completed.bgColorClass : eventTypes.applied.bgColorClass,
                                  'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white'
                                )}
                              >
                                { myBalance && myBalance.gt(ethers.utils.parseEther(item.amount)) ?
                                  <eventTypes.completed.icon className="w-5 h-5 text-white" aria-hidden="true" /> :
                                  <eventTypes.applied.icon className="w-5 h-5 text-white" aria-hidden="true" />
                                }
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-500">
                                  {item.content}{' '}
                                </p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                > { item.amount }
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}

                  </ul>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}

export default Endaoment;
