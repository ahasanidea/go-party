/* eslint-disable no-undef */
import bcrypt from 'bcrypt'

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        'User',
        {
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: {
                        msg: 'Username is required.',
                    },
                    len: {
                        args: [3, 15],
                        msg: 'Username length should be between 3 and 15 characters.',
                    },
                    async isUnique(value) {
                        const user = await User.findOne({ where: { username: value } })
                        if (user) {
                            throw new Error('A user with that username already exists.')
                        }
                    },
                },
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: {
                        msg: 'Invalid email. Provide a correct email.',
                    },
                    async isUnique(value) {
                        const user = await User.findOne({ where: { email: value } })
                        if (user) {
                            throw new Error('A user with that email already exists.')
                        }
                    },
                },
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: {
                        args: [6, 100],
                        msg: 'Password should be more than 5 characters.',
                    },
                },
            },
            bio: {
                type: DataTypes.TEXT,
                validate: {
                    len: {
                        args: [10, 500],
                        msg: 'Bio should be more than 10 characters and less than 500 characters',
                    },
                },
            },
            dob: {
                type: DataTypes.DATE,
            },
            avatar: {
                type: DataTypes.STRING,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }
        },
        {}
    )
    User.associate = function(models) {
        // associations can be defined here
    }
    User.prototype.findByCredentials = async (username, password) => {
        const user = await User.findOne({ username })
        if (!user) {
            throw new Error('Invalid login credentials')
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (!isPasswordMatch) {
            throw new Error('Invalid login credentials')
        }
        return user
    }

    // Hash the user password before saving it.
    User.beforeCreate(async user => {
        try {
            user.password = await bcrypt.hash(user.password, 8)
        } catch (error) {
            throw new Error('Something went wrong')
        }
    })

    return User
}
